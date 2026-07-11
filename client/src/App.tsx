import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { lazy, useEffect } from "react";
import Home from "./pages/home/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Docs from "./pages/docs/Docs";

const Playground = lazy(() => import("./pages/playground/Playground"));

export default function App() {
    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AppShell />
        </BrowserRouter>
    );
}

function AppShell() {
    const location = useLocation();
    const hideFooter = location.pathname.startsWith("/playground");

    useEffect(() => {
        document.title = location.pathname.startsWith("/playground")
            ? "Svg2GPU | Playground"
            : location.pathname.startsWith("/docs")
                ? "Svg2GPU | Documentation"
                : "Svg2GPU | SVGs at GPU speeds";
    }, [location.pathname]);

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/playground" element={<Playground />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            {!hideFooter ? <Footer /> : null}
        </>
    );
}

export function NotFound() {
    return (
        <main className="flex flex-col items-center justify-center gap-5">
            <div className="flex max-md:flex-col items-center justify-center gap-6">
                <h1>Error 404</h1>
                <div className="h-15 w-0.5 border-l-2 max-md:hidden"></div>
                <h2>This page could not be found.</h2>
            </div>
            <p className="text-(--gray]!">
                return to{" "}
                <Link to="/" className="underline!">
                    homepage
                </Link>
                .
            </p>
        </main>
    );
}
