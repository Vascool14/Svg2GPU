import { Link } from "react-router-dom";
import Logo from "./icons/Logo";
import NpmIcon from "./icons/NpmIcon";
import GithubIcon from "./icons/GithubIcon";
import "./components.css";

export default function Navbar() {
    return (
        <nav
            className="flex items-center border-b fixed top-0 left-0 w-screen h-(--nav-height) py-(--padding) px-(--side-padding) z-10 select-none"
            style={{
                background: "var(--bg-90)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease-out",
            }}
        >
            <Link to="/" className="mr-auto">
                <Logo height="2rem" />
            </Link>

            <Link to="/playground" className="navItem">
                Playground
            </Link>
            
            {/* use&nbsp;<Link to="https://github.com/memononen/nanosvg" target="_blank" rel="noopener noreferrer">https://github.com/memononen/nanosvg</Link>&nbsp;for best results */}
            <Link to="/docs" className="navItem">
                Docs
            </Link>
            <a
                href={`${import.meta.env.BASE_URL}typedoc/classes/Svg2GPU.html`}
                className="navItem max-sm:hidden"
            >
                Typedoc
            </a>

            <div className="sm:ml-auto h-full flex gap-3 items-center">
                {/* NPM */}
                <a
                    className="max-sm:hidden"
                    href="https://npmjs.com/package/svg2gpu"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="npm"
                >
                    <NpmIcon />
                </a>

                <div className="h-6 w-0.5 border-l mx-1"></div>

                {/* Github */}
                <a
                    href="https://github.com/vascool14/svg2gpu"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="github"
                >
                    <GithubIcon />
                </a>
            </div>
        </nav>
    );
}
