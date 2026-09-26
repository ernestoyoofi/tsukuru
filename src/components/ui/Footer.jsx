import { LogoGithub, Camera, Person, ArrowUpRight } from "@gravity-ui/icons";

const footerLink = [
  { icon: <LogoGithub />, label: "Github", href: "https://github.com/ernestoyoofi" },
  { icon: <Person />, label: "Profile", href: "https://yupiipi.id" },
  { icon: <Camera />, label: "Instagram", href: "https://instagram.com/nakiko.chan_" },
];

export default function Footer({ data = {} }) {
  return (
    <>
      <footer className="w-full overflow-hidden">
        <div className="w-full max-w-7xl m-auto px-6 p-2 flex flex-wrap justify-between">
          <div className="w-full border-t border-neutral-300 border-dashed my-3 flex items-center justify-center">
            <p className="text-[11px] bg-white border border-neutral-300 border-dashed -mt-[11px] px-4 text-neutral-400 select-none">Footer</p>
          </div>
          <div className="w-full md:w-[calc(100%-300px)] py-4 md:pr-6">
            <b className="font-semibold text-xl mb-2">
              {data.title || "Tsukuru (/)"}
            </b>
            <p className="text-sm text-neutral-600">
              {data.description ||
                "A highly customizable, aesthetic MDX blog template built with Next.js. (/)"}
            </p>
          </div>
          <div className="w-full md:w-[300px] py-4">
            <b className="font-semibold text-xl mb-2">Links</b>
            <ul className="list-none py-2">
              {footerLink.map((items, i) => (
                <li key={i} className="py-1 border-b border-dashed border-neutral-300">
                  <a href={items.href} target="_blank" className="group flex items-center justify-between text-neutral-600 hover:underline hover:text-blue-500 duration-200">
                    <span className="text-sm">{items.label}</span>
                    <div className="w-[16px] min-w-[16px] ml-2 flex items-center">
                      <span className="-ml-[16px] opacity-0 blur-sm group-hover:opacity-100 group-hover:ml-0 group-hover:blur-none duration-400"><ArrowUpRight /></span>
                      <span className="ml-0 opacity-100 blur-none group-hover:opacity-0 group-hover:ml-[16px] group-hover:blur-sm duration-400">{items.icon}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="w-full bg-neutral-100 p-4 text-center text-[0.8rem]">
          <p className="text-center text-neutral-400">{`© 2024 - ${new Date().getFullYear()} Ernestoyoofi.`}</p>
        </div>
      </footer>
    </>
  );
}
