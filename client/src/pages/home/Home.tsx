import LightningAnimation from "./LightningAnimation";

export default function Lightning() {
    return (
        <div className="w-full h-full">
            <section className="relative flex h-[155vh] w-full flex-col items-center justify-center overflow-hidden">
                <LightningAnimation />
            </section>
        </div>
    );
}
