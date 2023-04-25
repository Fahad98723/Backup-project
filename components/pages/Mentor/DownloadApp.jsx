import React from "react";
import mobile from "../../../assets/mentor/mobile.svg";
import google from "../../../assets/mentor/google.svg";
import apple from "../../../assets/mentor/apple.svg";
import { useRouter } from "next/router";

export default function DownloadApp() {
  const router = useRouter();
  return (
    <section className="mt-20 w-[433px] bg-primary md:w-full md:h-[590px]">
      <div className="flex items-center md:justify-center md:flex-row flex-col md:gap-[250px]">
        <div className="flex flex-col items-start text-[20px] px-5 text-white md:w-[531px] md:h-[308px]">
          <p className="md:text-[23px] md:mt-3 mt-10">GET THIS APP</p>
          <p className="md:text-[41px] mt-3">
            Download NOW and redefine success!
          </p>
          <p className="md:text-[18px] mt-5">
            Unleash your potential with Ostello! Personalized career journeys,
            expert guidance, and exclusive opportunities await.
          </p>
          <div className="flex md:justify-center md:flex-row flex-col items-center gap-5 md:mt-[80px] my-[50px]">
            <img
              className="w-[205px] h-[60px] cursor-pointer"
              src={google.src}
              onClick={() =>
                router.push(
                  "https://play.google.com/store/apps/details?id=com.ostello.mentors.mentorify",
                )
              }
              alt=""
            />
            <img
              className="w-[205px] h-[60px] cursor-pointer"
              src={apple.src}
              alt=""
            />
          </div>
        </div>
        <div className="">
          <img
            className="w-[308px] md:h-[439px] mt-[160px]"
            src={mobile.src}
            alt=""
          />
        </div>
      </div>
    </section>
  );
}
