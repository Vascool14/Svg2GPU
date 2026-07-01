import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
    titleComponent,
    children,
}: {
    titleComponent: string | React.ReactNode;
    children: React.ReactNode;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    const scaleDimensions = () => {
        return [1.2, 1.08];
    };

    const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
    const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

    return (
        <div
            className="h-[60rem] md:h-[80rem] flex items-center justify-center relative mt-[40vh]"
            ref={containerRef}
        >
            <div
                className="py-10 w-full relative"
                style={{
                    perspective: "1000px",
                }}
            >
                <Header translate={translate} titleComponent={titleComponent} />
                <Card rotate={rotate} scale={scale}>
                    {children}
                </Card>
            </div>
        </div>
    );
};

export const Header = ({ translate, titleComponent }: any) => {
    return (
        <motion.div style={{ translateY: translate }} className="div max-w-5xl mx-auto text-center">
            {titleComponent}
        </motion.div>
    );
};

export const Card = ({
    rotate,
    scale,
    children,
}: {
    rotate: MotionValue<number>;
    scale: MotionValue<number>;
    children: React.ReactNode;
}) => {
    return (
        <motion.div
            style={{ rotateX: rotate, scale }}
            className="relative max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full 
            overflow-hidden rounded-[30px] border backdrop-blur-2xl backdrop-saturate-150"
        >
            <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-[linear-gradient(130deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.12)_34%,rgba(255,255,255,0.04)_58%,rgba(255,255,255,0.12)_100%)]" />
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/20 bg-[radial-gradient(120%_120%_at_10%_0%,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.1)_30%,rgba(255,255,255,0.04)_55%,rgba(8,12,24,0.5)_100%)] md:rounded-2xl md:p-4">
                {children}
            </div>
        </motion.div>
    );
};
