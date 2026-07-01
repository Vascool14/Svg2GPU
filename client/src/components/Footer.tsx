import Logo from "./icons/Logo";
import { Link } from "react-router-dom";

const GITHUB_REPO_URL = "https://github.com/vascool14/svg2gpu";
const GITHUB_LICENSE_URL = `${GITHUB_REPO_URL}/blob/main/LICENSE`;
const GITHUB_ISSUE_URL = `${GITHUB_REPO_URL}/issues/new?labels=bug`;
const GITHUB_FEATURE_URL = `${GITHUB_REPO_URL}/issues/new?labels=enhancement`;

export default function Footer() {
    return (
        <footer
            className="w-full f-full min-h-(--footer-height) py-12 border-t px-(--side-padding) 
            grid grid-cols-2 lg:grid-cols-4 gap-12"
        >
            <div className="flex flex-col text-left">
                <Logo height="2rem" padding="0.25rem" />
            </div>

            <div className="flex flex-col text-left gap-2">
                <h5 className="mb-2!">Resources</h5>
                <Link to="/playground">
                    <p className="pLink">Playground</p>
                </Link>
                <Link to="/docs">
                    <p className="pLink">Docs</p>
                </Link>
                <Link to="/typedoc">
                    <p className="pLink">TypeDoc</p>
                </Link>
            </div>
            <div className="flex flex-col text-left gap-2">
                <h5 className="mb-2!">Misc</h5>
                <a href={GITHUB_LICENSE_URL} target="_blank" rel="noopener noreferrer">
                    <p className="pLink">License</p>
                </a>
                <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
                    <p className="pLink">Contribute</p>
                </a>
            </div>
            <div className="flex flex-col text-left gap-2">
                <h5 className="mb-2!">Contact</h5>
                <a href={GITHUB_ISSUE_URL} target="_blank" rel="noopener noreferrer">
                    <p className="pLink">Report an Issue</p>
                </a>
                <a href={GITHUB_FEATURE_URL} target="_blank" rel="noopener noreferrer">
                    <p className="pLink">Request a Feature</p>
                </a>
                <a
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-(--text) text-(--bg) rounded-md px-4 py-2 text-lg mt-4 mr-auto"
                >
                    Contact
                </a>
            </div>
        </footer>
    );
}
