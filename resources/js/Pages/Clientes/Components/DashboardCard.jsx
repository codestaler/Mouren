import { FaArrowRight } from "react-icons/fa";

export default function DashboardCard({

    icon,

    title,

    value,

    subtitle,

    description,

    buttonText = "Explorar",

    color = "#5D4E3F",

    background = "#F8F5EF",

    textColor = "#5D4E3F",

    reproduciendo = false,

    image = null,

    onClick = () => { }

}) {

    return (

        <div
            style={{
                background: background,
            }}

            onClick={onClick}

            className={`
                relative
                overflow-hidden
                rounded-[38px]
                cursor-pointer
                group
                transition-all
                duration-700
                hover:-translate-y-2
                hover:shadow-[0_25px_60px_rgba(0,0,0,.18)]
                
                ${reproduciendo
                    ? "bg-[#3E342B]/90 border-[#8A715A]"
                    : "border"
                }
            `}
        >

            {/* Brillo */}

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">

                <div className="absolute -left-40 top-0 h-full w-24 rotate-12 bg-white/40 blur-xl group-hover:left-[130%] transition-all duration-[1600ms]" />

            </div>

            {/* Flores */}

            <img

                src="/images/login/elementos_dashboard/flores_esquinas_tarjeta.png"

                className="
                absolute
                bottom-0
                right-0
                w-40
                opacity-10
                pointer-events-none
                transition-all
                duration-700
                group-hover:opacity-25
                group-hover:scale-110
                group-hover:rotate-3
                "

            />

            <div className="p-5 relative z-10">

                <div className="flex justify-between">

                    <div>

                        <div

                            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:rotate-6"
                            style={{
                                backgroundColor: color,
                                color: "#FFFFFF"
                            }}
                        >

                            {image ? (

                                <img

                                    src={image}

                                    className="w-8"

                                />

                            ) : (

                                icon

                            )}

                        </div>

                    </div>

                </div>

                <div className="mt-4">

                    <p className="uppercase tracking-[4px] text-[9px] opacity-60 font-bold">

                        {subtitle}

                    </p>

                    <h3
                        className="font-black text-base mt-1"
                        style={{
                            color: reproduciendo ? "#FFFFFF" : textColor
                        }}
                    >

                        {title}

                    </h3>

                    <h2

                        className="font-black mt-5"

                        style={{

                            fontSize: "2rem",

                            color

                        }}

                    >

                        {value}

                    </h2>

                    <p
                        className="text-[13px] leading-relaxed mt-3"
                        style={{
                            color: reproduciendo ? "#E8E8E8" : textColor,
                            opacity: 0.75
                        }}
                    >

                        {description}

                    </p>

                </div>

                <div className="mt-5 flex items-center gap-3 font-bold text-sm group/link">

                    <span style={{ color }}>

                        {buttonText}

                    </span>

                    <FaArrowRight

                        style={{ color }}

                        className="transition-all duration-300 group-hover/link:translate-x-2"

                    />

                </div>

            </div>

        </div>

    );

}