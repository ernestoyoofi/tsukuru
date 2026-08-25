import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 left-0 w-full p-2">
      <div className="w-full max-w-7xl m-auto h-12.5 flex items-center justify-between">
        <div className="w-full h-12.5 max-w-52.5 flex items-center justify-start">
          <Image
            src="/images/icon-web.svg"
            width={200}
            height={60}
            className="w-auto h-12.5 object-contain"
            alt="Icon"
          />
        </div>
        <div className="w-full h-12.5"></div>
        <div className="w-full h-12.5 max-w-52.5"></div>
      </div>
    </header>
  );
}
