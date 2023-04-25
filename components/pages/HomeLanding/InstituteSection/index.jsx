import { Tabs } from "antd";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setFields, setSearch } from "../../../../redux/slices/courseSlice";
import {
  setClass,
  setLocationQuery,
} from "../../../../redux/slices/SearchSlice";

import { host } from "../../../../utils/constant";

import dynamic from "next/dynamic";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

const InstituteCard = dynamic(
  () => {
    return import("../../../UI/InstituteCard");
  },
  { ssr: false }
);
const Segments = dynamic(
  () => {
    return import("./Segments");
  },
  { ssr: false }
);

export default function InstituteSection() {
  const [activeTab, setActiveTab] = useState("");
  const [topLocationData, setTopLocationData] = useState();

  const [state, setState] = useState(location?.region_name || "Delhi");

  useEffect(() => {
    if (
      location?.region_name === "Delhi" ||
      location?.region_name === "Uttar Pradesh" ||
      location?.region_name === "Haryana"
    ) {
      setState(location?.region_name);
    }
  }, [location?.region_name]);
  const router = useRouter();
  useEffect(() => {
    try {
      axios
        .get(`${host}/locations?state=${state}&limit=100`)
        .then(function (response) {
          setTopLocationData(response.data.message);
          console.log(response.data.message);
        });
    } catch (err) {
      console.log(err);
    }
  }, [dispatch, state]);

  const [subLocationsData, setSubLocationsData] = useState([]);
  const [isViewMore, setIsViewMore] = useState(false);
  const [itemCount, setItemCount] = useState(20);
  const [subLocationCount, setSubLocationCount] = useState(0);

  useEffect(() => {
    if (state) {
      try {
        axios
          .get(`${host}/locations?city=${activeTab}&limit=${itemCount}`)
          .then(function (response) {
            setSubLocationsData(response.data.message);
            setSubLocationCount(response.data.count);
            console.log(response.data.message, "locations");
          });
      } catch (err) {
        console.log(err);
      }
    }
  }, [dispatch, state, activeTab, itemCount]);

  const [locationWay, setLocationWay] = useState();
  const dispatch = useDispatch();

  const [ipAddress, setIpAddress] = useState("");
  const [location, setLocation] = useState({});

  useEffect(() => {
    axios
      .get("/api/ip")
      .then((response) => {
        setIpAddress(response.data.ip);
      })
      .catch((error) => console.log("error", error));
  }, []);

  console.log(ipAddress, "ravi ip");

  useEffect(() => {
    if (ipAddress) {
      axios
        .get(`https://api.apilayer.com/ip_to_location/${ipAddress}`, {
          headers: {
            apikey: "GJ7onKIHLk9jXHSiUaC6zD6lhzQd8JGz",
          },
        })
        .then((response) => {
          setLocation(response.data);
          if (
            response.data?.region_name === "Delhi" ||
            response.data?.region_name === "Uttar Pradesh" ||
            response.data?.region_name === "Haryana"
          ) {
            setState(response.data?.region_name);
          }
          console.log(response.data, "last");
        })
        .catch((error) => console.log("error", error));

      // fetch(`https://api.iplocation.net/?ip=${"103.127.0.26"}`)
      //   .then(function (response) {
      //     response.json().then((jsonData) => {
      //       console.log(jsonData, "location");
      //     });
      //   })
      //   .catch(function (error) {
      //     console.log(error);
      //   });
    }
  }, [ipAddress]);

  const getFilterInstitutes = async (place) => {
    await axios
      .get(`${host}/institute?approval=1&location=${place}&limit=6`)
      .then(function (response) {
        setLocationWay(response.data.message);
        console.log(locationWay);
      });
  };

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    let location = [];
    const data = topLocationData?.filter(
      (a) => a.state.toLowerCase() === state.toLowerCase()
    );
    data?.forEach((element) => {
      location.push({
        state: element?.state,
        title: element?.city,
        subLocations: topLocationData?.filter((t) => t?.city === element?.city),
      });
    });
    let uniqueIds = [];

    const unique = location?.filter((element) => {
      const isDuplicate = uniqueIds.includes(element.title);

      if (!isDuplicate) {
        uniqueIds.push(element.title);

        return true;
      }

      return false;
    });

    setLocations(unique);
    console.log(location, unique);
  }, [topLocationData, state]);

  useEffect(() => {
    if (locations) {
      const data = locations?.filter((a) => a.state === state)[0]?.title;
      if (data && !activeTab) {
        setActiveTab(data);
        getFilterInstitutes(data);
        if (!activeTab) {
          setActiveTab(data);
          getFilterInstitutes(data);
        }
      }
      console.log(data);
    }
  }, [locations, state, activeTab]);

  console.log(state, locationWay, activeTab, location, locations, "last");

  return (
    <section className="container mx-auto p-5 lg:p-10 ">
      <div className=" text-center my-10 space-y-5 ">
        <h1 className=" leading-none font-bold text-xl lg:text-5xl ">
          Top Locations in India
        </h1>
        <p className="lg:text-lg">
          Choose from the best and the most suitable locations near you.
        </p>

        <div className="bg-[#F1F1F1] border border-[#DADADA] rounded-[50px] w-fit p-3 mx-auto flex justify-between">
          <button
            onClick={() => {
              setState("Uttar Pradesh");

              setActiveTab(
                locations?.filter((a) => a.state === "Uttar Pradesh")[0]?.title
              );
              getFilterInstitutes(
                locations?.filter((a) => a.state === "Uttar Pradesh")[0]?.title
              );
            }}
            className={`  py-2 md:text-lg   ${
              state === "Uttar Pradesh"
                ? "bg-[#7D23E0] text-white font-semibold md:px-6 px-3 mx-2"
                : "text-[#454C5C] md:px-3 px-2"
            } rounded-[50px] hover:scale-105 duration-200 text-sm whitespace-nowrap`}
          >
            Uttar Pradesh
          </button>
          <div className=" border-r-2 border-black "></div>
          <button
            onClick={() => {
              setState("Delhi");
              setActiveTab(
                locations?.filter((a) => a.state === "Delhi")[0]?.title
              );
              getFilterInstitutes(
                locations?.filter((a) => a.state === "Delhi")[0]?.title
              );
            }}
            className={`  py-2 md:text-lg mx-2 ${
              state === "Delhi"
                ? "bg-[#7D23E0] text-white font-semibold md:px-6 px-3 mx-2"
                : "text-[#454C5C] md:px-3 px-2"
            } rounded-[50px] hover:scale-105 duration-200 text-sm whitespace-nowrap`}
          >
            Delhi
          </button>
          <div className=" border-r-2 border-black "></div>
          <button
            onClick={() => {
              setState("Haryana");
              setActiveTab(
                locations?.filter((a) => a.state === "Haryana")[0]?.title
              );
              getFilterInstitutes(
                locations?.filter((a) => a.state === "Haryana")[0]?.title
              );
            }}
            className={`  py-2 md:text-lg mx-2 ${
              state === "Haryana"
                ? "bg-[#7D23E0] text-white font-semibold md:px-6 px-3 mx-2"
                : "text-[#454C5C] md:px-3 px-2"
            }    rounded-[50px] hover:scale-105 duration-200 text-sm whitespace-nowrap`}
          >
            Haryana
          </button>
        </div>
      </div>

      <Tabs
        centered
        defaultActiveKey={activeTab}
        className="max-w-5xl mx-auto"
        onChange={(e) => {
          getFilterInstitutes(e);
          setActiveTab(e);
          console.log(e);
        }}
      >
        {locations
          .filter((a) => a.title.length > 0)
          .filter((a) => a.state === state)
          .map((item, key) => (
            <>
              <Tabs.TabPane key={item.title} tab={item.title}>
                <Segments className=" " options={subLocationsData} />
              </Tabs.TabPane>
            </>
          ))}
      </Tabs>

      {subLocationCount > 20 ? (
        <div
          onClick={() => {
            const itemHandler = () => {
              if (!isViewMore) {
                setItemCount(40);
              } else {
                setItemCount(20);
              }
            };
            itemHandler();
            setIsViewMore(!isViewMore);
          }}
          className="text-md bg-black w-[120px] rounded-md mx-auto my-2 text-white p-2 flex items-center space-x-2 cursor-pointer justify-center"
        >
          <p>{isViewMore ? "View Less" : "View More"}</p>
          {isViewMore ? (
            <UpOutlined className="flex items-center text-xs" />
          ) : (
            <DownOutlined className="flex items-center text-xs" />
          )}
        </div>
      ) : (
        ""
      )}

      <div className=" mt-10 mx-auto  grid lg:grid-cols-2 xl:grid-cols-3 grid-cols-1 gap-[60px] ">
        {locationWay
          // ?.sort((a, b) => b?.images?.length - a?.images?.length)
          // ?.sort((a, b) => b?.reviews?.length - a?.reviews?.length)
          // ?.sort((a, b) => b?.rating - a?.rating)
          // ?.slice(0, 6)
          ?.map((item, key) => (
            <InstituteCard {...item} key={key} />
          ))}
      </div>
      <div className="flex justify-center my-10">
        <button
          onClick={() => {
            dispatch(setFields(""));
            dispatch(setClass([]));
            dispatch(setLocationQuery(state));
            dispatch(
              setSearch({
                type: "institute",
                name: "",
              })
            );
            router.push(`/search/${state?.toLowerCase()?.replace(/ /g, "-")}`);
          }}
          className=" px-6 py-2 md:text-lg  bg-black text-white rounded-md hover:scale-105 duration-200 "
        >
          Explore More
        </button>
      </div>
    </section>
  );
}
