import { useState, useRef, useEffect, useCallback } from "react";
import toast, { Toaster } from 'react-hot-toast';
import CryptoJS from "crypto-js";
import { FaDownload, FaCopy , FaDeleteLeft } from "react-icons/fa6";
import debounce from 'lodash/debounce';
import ReactLoading from 'react-loading';

const App = () => {
  const [id, setId] = useState(localStorage.getItem("qqId") || "");
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const presetImageUrl = "./images/mask.png";
  const fallbackImageUrl = "./images/fallback.jpg";

  const isValidQQNumber = (qq: string) => {
      return /^[1-9][0-9]{4,10}$/.test(qq);
  };

  const fetchAvatar = async () => {
    if (!id) return;
    if (!isValidQQNumber(id)) {
      toast.error("请输入合法的QQ号码");
      return;
    }

    setLoading(true);
    const presetImage = new Image();
    presetImage.crossOrigin = "anonymous";
    presetImage.src = presetImageUrl;

    const avatarImage = new Image();
    avatarImage.crossOrigin = "anonymous";
    avatarImage.src = `https://guq-img.122999.xyz/avatar/${id}`;

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        presetImage.onload = () => resolve();
        presetImage.onerror = () => reject();
      }),
      new Promise<void>((resolve, reject) => {
        avatarImage.onload = () => resolve();
        avatarImage.onerror = () => reject();
      }),
    ]);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const avatarSize = 138;
    ctx.drawImage(
      avatarImage,
      0,
      canvas.height - avatarSize,
      avatarSize,
      avatarSize
    );

    ctx.drawImage(presetImage, 0, 0, canvas.width, canvas.height);
    
    setLoading(false);
  };

  const debouncedFetchAvatar = useCallback(debounce(fetchAvatar, 300), [id]);

  useEffect(() => {
    debouncedFetchAvatar();

    if (!id) {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      const fallbackImage = new Image();
      fallbackImage.crossOrigin = "anonymous";
      fallbackImage.src = fallbackImageUrl;

      fallbackImage.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(fallbackImage, 0, 0, canvas.width, canvas.height);
      };
    }

    return () => {
      debouncedFetchAvatar.cancel();
    };
  }, [id, debouncedFetchAvatar]);

  const handleDownload = () => {
    if (!id || !isValidQQNumber(id)) {
      toast.error("请输入合法的QQ号码再下载");
      return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        const md5Id = CryptoJS.MD5(id).toString();
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `${md5Id}.png`;
        link.click();
      } catch (err) {
        console.error("下载失败: ", err);
        toast.error("下载失败，请手动下载");
      }
    }
  };

  const handleCopy = async () => {
    if (!id || !isValidQQNumber(id)) {
      toast.error("请输入合法的QQ号码再复制");
      return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          toast.success("表情已复制到剪贴板");
        }
      } catch (err) {
        console.error("复制失败: ", err);
        toast.error("复制失败，请手动复制");
      }
    }
  };

  return (
    <div className='bg-gray-100 min-h-screen flex flex-col'>
      {/* Navbar */}
      <div className="navbar bg-base-100 flex-wrap w-full justify-between items-center">
        <a className="btn btn-ghost text-xl">卡丘表情包生成器</a>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto p-4 flex-1 w-full">
        <div className="card bg-base-100 shadow-xl w-full">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left side - Canvas */}
              <div className="flex justify-center items-center w-full lg:w-2/3 relative">
                <canvas
                  className="w-full border border-gray-300 rounded-lg"
                  ref={canvasRef}
                  width={512}
                  height={512}
                />
                {loading && (
                  <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
                    <ReactLoading type="spin" color="#000" height={50} width={50} />
                  </div>
                )}
              </div>
              {/* Right side - Controls */}
              <div className="flex flex-col gap-6 w-full lg:w-2/3 lg:ml-8 justify-center">
                <h2 className="text-3xl font-bold mb-4 text-center">卡拉彼丘是一款你的问题</h2>
                <div className="flex items-center gap-4">
                  <div className="avatar">
                    <div style={{ marginTop: 15 }} className="w-20 h-20 rounded-full rounded-xl ring-offset-base-100 ring-offset-2 relative">
                      {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ReactLoading type="spin" color="#000" height={40} width={40} />
                        </div>
                      ) : id && isValidQQNumber(id) ? (
                        <img
                          src={`https://guq-img.122999.xyz/avatar/${id}`}
                          alt="Avatar"
                        />
                      ) : (
                        <div className="bg-gray-200 w-full h-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="form-control w-full max-w-sm">
                    <label className="label">
                      <span className="label-text text-lg font-medium">QQ号码</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="请输入QQ号码"
                        className="input input-bordered w-full pr-12"
                        value={id}
                        onChange={(e) => {
                          setId(e.target.value);
                          localStorage.setItem("qqId", e.target.value);
                        }}
                        disabled={loading}
                      />
                      {id && (
                        <div className="absolute top-0 right-0 h-full flex items-center pr-3">
                          <button className="btn btn-circle btn-sm"
                            onClick={() => {
                              setId("");
                              localStorage.removeItem("qqId");
                            }}>
                            <FaDeleteLeft />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button className="btn btn-outline btn-neutral" onClick={handleDownload} disabled={loading}>
                    <FaDownload />下载表情
                  </button>
                  <button className="btn btn-outline btn-neutral" onClick={handleCopy} disabled={loading}>
                    <FaCopy />复制表情
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Include Toast container */}
        <div>
          <Toaster
            position="top-right"
            reverseOrder={false}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
