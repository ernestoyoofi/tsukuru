import { ArrowUpRight } from "@gravity-ui/icons";

export default function Footer({ data = {} }) {
  const currentYear = new Date().getFullYear();
  const footerLinks = [data.link0, data.link1, data.link2]
    .map((link, index) => ({ link, key: `link${index}` }))
    .filter(({ link }) => link?.label && link.list?.length);

  return (
    <footer className="w-full overflow-hidden">
      <div className="w-full max-w-7xl m-auto px-6 p-2 flex flex-wrap justify-between">
        <div className="w-full py-4 md:w-m-[700px] xl:flex-1 md:pr-6">
          <b className="font-semibold text-xl mb-2">
            {data.title || "Tsukuru (/)"}
          </b>
          <p className="text-sm text-neutral-600">
            {data.description ||
              "A highly customizable, aesthetic MDX blog template built with Next.js. (/)"}
          </p>
        </div>
        {footerLinks.map(({ link, key }) => (
          <div key={key} className="w-full sm:w-[180px] py-4">
            <b className="font-semibold text-xl mb-2">{link.label}</b>
            <ul className="list-none py-2">
              {link.list.map((item, indexing) => (
                <li key={`${item.label}-${indexing}`} className="w-full">
                  <a
                    href={item.href}
                    target="_blank"
                    title={item.label}
                    className="group flex items-center justify-start text-neutral-600 hover:underline hover:text-blue-500 duration-200 py-1"
                  >
                    <div className="w-4 min-w-4 mr-1 -ml-5 group-hover:ml-0 flex items-center duration-200 pointer-events-none">
                      <span className="rotate-180 -ml-4 opacity-0 blur-sm group-hover:rotate-0 group-hover:opacity-100 group-hover:ml-0 group-hover:blur-none duration-300">
                        <ArrowUpRight />
                      </span>
                    </div>
                    <span className="text-sm group-hover:font-semibold">
                      {item.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="w-full bg-neutral-50 p-4 text-center text-[0.8rem] select-none">
        <p className="text-center text-neutral-600">
          {`© ${data.fromyear ?? currentYear}${data.fromyear < currentYear ? ` - ${currentYear}` : ""}${data.yourname ? ` ${data.yourname}` : ""}.`}
          <a
            className="ml-1 hover:text-blue-500 hover:underline duration-300"
            href="https://github.com/ernestoyoofi/tsukuru"
            target="_blank"
            rel="noopener"
          >
            • Tsukuru Engine
          </a>
        </p>
      </div>
    </footer>
  );
}
