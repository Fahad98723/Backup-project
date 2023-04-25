import { useRouter } from "next/router";
import React from "react";
import coachingImage from "../../../../assets/Pages/Home/images/coaching.webp";
import coachingImageMobile from "../../../../assets/Pages/Home/images/coachingmobile.webp";
import Image from "next/image";
export default function TwoRowCard() {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.push("/coaching-in-99");
      }}
      className="rounded-xl w-full lg:max-w-[370px]  sm:h-auto h-[350px] bg-primary"
    >
      <div className="h-full w-full lg:block hidden">
        <Image
          width="0"
          height="0"
          sizes="100vw"
          src={coachingImage.src}
          className="h-full w-full rounded-xl  cursor-pointer"
          alt=""
        />
      </div>

      <div className="lg:hidden block h-full w-full rounded-xl">
        <Image
          width="0"
          height="0"
          sizes="100vw"
          src={coachingImageMobile.src}
          className="h-full w-full rounded-xl  cursor-pointer"
          alt=""
        />
      </div>
    </div>
  );
}
