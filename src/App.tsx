import { useState, useRef, useEffect } from "react";
import { Avatar, Input, Card, CardBody } from "@nextui-org/react";
import "./App.css";

const App = () => {
  const [id, setId] = useState(localStorage.getItem("qqId"));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);

  // 预设图像URL
  const presetImageUrl = "mask.png";

  // 加载并绘制预设图像和头像
  const fetchAvatar = async () => {
    // 加载预设图像
    const presetImage = new Image();
    presetImage.crossOrigin = "";
    presetImage.src = presetImageUrl;

    // 加载头像图像
    const avatarImage = avatarRef.current!;

    // 等待图片加载完成后绘制
    presetImage.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      avatarImage.onload = () => {
        // 绘制头像到左下角
        const avatarSize = 138;
        ctx.drawImage(
          avatarImage,
          0,
          canvas.height - avatarSize,
          avatarSize,
          avatarSize
        );
        ctx.drawImage(presetImage, 0, 0, canvas.width, canvas.height);
      };
    };
  };

  // 未输入QQ号码时依绘制上次的图像
  useEffect(() => {
    fetchAvatar();
  }, []);

  return (
    <>
      <Card>
        <CardBody>
          <div className="grid grid-cols-6 xl:col-span-12 gap-4">
            <div className="col-span-6 md:col-span-4 max-fit">
              <canvas
                className="max-h-full max-w-full"
                ref={canvasRef}
                width={512}
                height={512}
                style={{ border: "1px solid #ccc", borderRadius: "12px" }}
              />
            </div>
            <div className="flex flex-row col-span-6 md:col-span-8 gap-4 max-h-fit">
              <div>
                <img
                  className="hidden"
                  src={
                    id ? `https://q1.qlogo.cn/g?b=qq&nk=${id}&s=640` : undefined
                  }
                  ref={avatarRef}
                />
                <Avatar
                  isBordered
                  size="lg"
                  radius="sm"
                  src={
                    id ? `https://q1.qlogo.cn/g?b=qq&nk=${id}&s=640` : undefined
                  }
                />
              </div>
              <Input
                fullWidth
                isClearable
                variant="bordered"
                label="QQ号码"
                size="md"
                value={id || ""}
                onClear={() => {
                  setId("");
                  localStorage.removeItem("qqId");
                }}
                onChange={(e) => {
                  setId(e.target.value);
                  localStorage.setItem("qqId", e.target.value);
                  fetchAvatar();
                }}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default App;
