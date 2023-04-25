import React from "react";
import mentorImage from "../../../../assets/Pages/Home/images/mentorImage.webp";
import mentorImageMobile from "../../../../assets/Pages/Home/images/mentorImageMobile.webp";
import { useRouter } from "next/router";
import Image from "next/image";

export default function TwoColCard() {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.push("/mentor");
      }}
      className="rounded-xl w-full lg:max-w-[690px] sm:h-auto h-[350px] relative"
    >
      <Image
        width="0"
        height="0"
        sizes="100vw"
        alt=""
        src={mentorImage.src}
        className="h-full w-full rounded-xl  lg:block hidden cursor-pointer"
      />
      <Image
        objectFit="cover"
        layout="fill"
        src={mentorImageMobile.src}
        className="h-full w-full rounded-xl  block lg:hidden cursor-pointer"
        alt=""
      />
    </div>
  );
}
