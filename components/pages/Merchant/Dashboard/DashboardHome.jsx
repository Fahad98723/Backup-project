import React, { useState, useEffect } from "react";
import img1 from "../../../../assets/merchantDashboard/Accountancy/defaultbg.png";
import { AiOutlineArrowDown } from "react-icons/ai";
import { AiOutlineArrowUp } from "react-icons/ai";
import { ImCross } from "react-icons/im";
import HeaderCard from "./DashboardHome/HeaderCard/HeaderCard";
// import Charts from './DashboardHome/Chart/Charts';
// import PieChart from './DashboardHome/Chart/PieChart';
import RecentOrder from "./DashboardHome/RecentOrder/RecentOrder";
import { Box, Modal, Rating } from "@mui/material";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import {
  getMerchantAnalytics,
  selectUserAnalytics,
} from "../../../../redux/slices/UserAnalytics";
import { host, INSTITUTE_ID } from "../../../../utils/constant";
import moment from "moment";
import UserStats from "./DashboardHome/Chart/UserStats";
import { authSelector } from "../../../../redux/slices/authSlice";
import { GiCancel } from "react-icons/gi";
import axios from "axios";
import { useRef } from "react";
import toast from "react-hot-toast";
import DashboardPayment from "./DashboardPayment";
import UpgardeModal from "./UpgradeModal/UpgardeModal";

const PieChart = dynamic(() => import("./DashboardHome/Chart/PieChart"), {
  ssr: false,
});

const Charts = dynamic(() => import("./DashboardHome/Chart/Charts"), {
  ssr: false,
});

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
  borderRadius: "5px",
};

const DashboardHome = () => {
  const [slice, setSlice] = useState(2);
  const [dates, setDates] = useState([]);
  const [datesData, setDatesData] = useState([]);
  const [visitInstitute, setVisitInstitute] = useState([]);
  const [knowInstitute, setKnowInstitute] = useState([]);
  const [researchFaculty, setResearchFaculty] = useState([]);
  const [watchVideos, setWatchVideos] = useState([]);
  const [exploreCourses, setExploreCourses] = useState([]);
  const [openStats, setOpenStats] = useState(false);
  // const { merchantAnalytics } = useSelector(selectUserAnalytics);
  const [merchantAnalytics, setMerchantAnalytics] = useState([]);
  const [merchantAnalyticsData, setMerchantAnalyticsData] = useState([]);
  const dispatch = useDispatch();
  const data = [];

  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const handleStats = () => {
    setOpenStats(!openStats);
  };
  const [revenueData, setRevenueData] = useState({});
  const getRevenue = async (id) => {
    try {
      const response = await axios.get(
        `${host}/course/purchased?instituteid=${id}`,
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${
              typeof window !== "undefined" &&
              window.localStorage.getItem("ACCESS_TOKEN")
            }`,
          },
        }
      );

      let studentCount = 0;
      let revenueCount = 0;
      response?.data?.courses?.map((item) => {
        studentCount = studentCount + item?.studentsenrolled;
        revenueCount =
          revenueCount + item?.pricingdetails?.subscription?.amount;
      });
      const c = {
        totalStudent: studentCount,
        totalRevenue: revenueCount,
        coursesSold: response?.data?.courses?.length,
      };
      setRevenueData(c);
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };
  console.log(revenueData);

  const { instituteDetails } = useSelector(authSelector);

  useEffect(() => {
    if (instituteDetails?.id?.length > 0) {
      getRevenue(instituteDetails?.id);
      // dispatch(getMerchantAnalytics(INSTITUTE_ID))

      const getMerchantAnalytics = async () => {
        try {
          const response = await axios.get(
            `${host}/analytics?instituteid=${instituteDetails?.id}&limit=1000`,
            {
              headers: {
                "Access-Control-Allow-Origin": "*",
                Authorization: `Bearer ${
                  typeof window !== "undefined" &&
                  window.localStorage.getItem("ACCESS_TOKEN")
                }`,
              },
            }
          );
          setMerchantAnalytics(response.data.message);
          console.log(response.data.message, "analytics data", INSTITUTE_ID);
        } catch (err) {
          console.log(err);
        }
      };
      getMerchantAnalytics();

      const getMerchantAnalyticsData = async () => {
        try {
          const response = await axios.get(
            `${host}/analytics/generate?instituteId=${instituteDetails?.id}&dateRange=10`,
            {
              headers: {
                "Access-Control-Allow-Origin": "*",
                Authorization: `Bearer ${
                  typeof window !== "undefined" &&
                  window.localStorage.getItem("ACCESS_TOKEN")
                }`,
              },
            }
          );
          setMerchantAnalyticsData(response.data.analytics);
          console.log(response.data.analytics, "analytics data", INSTITUTE_ID);
        } catch (err) {
          console.log(err);
        }
      };
      getMerchantAnalyticsData();
    }
  }, [dispatch, instituteDetails?.id]);

  const [city, setCity] = useState(instituteDetails?.locations?.[0].city);
  const [area, setArea] = useState(instituteDetails?.locations?.[0].area);
  const [areaError, setAreaError] = useState("");
  const [areaOptions, setAreaOptions] = useState([]);
  const [state, setState] = useState(instituteDetails?.locations?.[0].state);
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState(
    instituteDetails?.locations?.[0].pincode
  );
  const [pincodeError, setPincodeError] = useState("");

  console.log(pincode);

  const handleGenerateFromPincode = (pinCode) => {
    console.log(pinCode, pinCode.length);
    if (pinCode?.length) {
      if (pinCode.length !== 6) {
        toast.error("Enter a valid pincode");
        setPincodeError("Enter a valid pincode");
        setAreaOptions([]);
        setArea("");
        setCity("");
        setState("");
        setCountry("");
        return;
      }
      return;
    }
    axios
      .get(`https://api.postalpincode.in/pincode/${pinCode}`)
      .then((res) => {
        setAreaOptions([]);
        res?.data?.map((item) =>
          item?.PostOffice?.forEach((po) => {
            setAreaOptions((prev) => {
              if (prev.indexOf(po.Name) === -1) {
                return [...prev, po.Name];
              }
              return prev;
            });
          })
        );

        setCity(res?.data[0]?.PostOffice[0]?.District);
        setState(res?.data[0]?.PostOffice[0]?.State);
        setCountry(res?.data[0]?.PostOffice[0]?.Country);
        setPincodeError("");
      })
      .catch((err) => console.log(err));
  };

  const infoGenRef = useRef(null);

  const handleChange = (event, setFunction) => {
    setFunction(event.target.value);
  };

  useEffect(() => {
    let visit_institute = [];
    let know_institute = [];
    let research_faculties = [];
    let explore_courses = [];
    let watch_videos = [];

    let DataWithTime = (time = "", dataArray = []) => {
      const temp = new Set();
      let arr = [];
      dataArray?.map((u) => temp.add(u?.payload?.userid));
      arr = [...temp];
      return {
        date: time,
        data: dataArray,
        totalUsers: dataArray?.length,
        oldUsers: arr?.length,
        newUsers: dataArray?.length - arr?.length,
      };
    };

    const set_of_dates = new Set();
    const setOfType = new Set();
    const setOfLocations = new Set();
    merchantAnalytics?.map((items) => {
      set_of_dates?.add(
        moment(items?.timestamp?.split("T")[0])?.format("ll")?.split(",")[0]
      );
      setOfType.add(items?.activity_type);
      // setOfLocations.add(items?.area)
    });
    let allArea = [...setOfLocations];
    let allDates = [...set_of_dates];
    console.log(allArea);
    let dates_data = [];
    allDates?.map((date) => {
      let data_of_date = merchantAnalytics?.filter(
        (item) =>
          moment(item?.timestamp?.split("T")[0])
            ?.format("ll")
            ?.split(",")[0] === date
      );
      let visit_institute_dod = [];
      let know_institute_dod = [];
      let research_faculties_dod = [];
      let explore_courses_dod = [];
      let watch_videos_dod = [];

      dates_data.push({ date: date, data: data_of_date });

      data_of_date.forEach((data) => {
        if (data.activity_type === "visit_institute") {
          visit_institute_dod.push(data);
        }
        if (data.activity_type === "know_institute") {
          know_institute_dod.push(data);
        }
        if (data.activity_type === "explore_courses") {
          explore_courses_dod.push(data);
        }
        if (data.activity_type === "research_faculties") {
          research_faculties_dod.push(data);
        }
        if (data.activity_type === "watch_videos") {
          watch_videos_dod.push(data);
        }
      });
      visit_institute.push(DataWithTime(date, visit_institute_dod));
      know_institute.push(DataWithTime(date, know_institute_dod));
      explore_courses.push(DataWithTime(date, explore_courses_dod));
      research_faculties.push(DataWithTime(date, research_faculties_dod));
      watch_videos.push(DataWithTime(date, watch_videos_dod));
    });
    let dateCollect = [];
    const options = { month: "long", day: "numeric" };
    merchantAnalyticsData.forEach((a) => {
      dateCollect.push(new Date(a.date).toLocaleDateString("en-US", options));
    });
    console.log(dateCollect, "date collect");
    setDates(dateCollect);
    // setDatesData(dates_data);
    setVisitInstitute(visit_institute);
    setKnowInstitute(know_institute);
    setExploreCourses(explore_courses);
    setResearchFaculty(research_faculties);
    setWatchVideos(watch_videos);
  }, [merchantAnalytics, merchantAnalyticsData]);

  console.log(
    datesData,
    visitInstitute,
    knowInstitute,
    exploreCourses,
    researchFaculty,
    watchVideos
  );

  return (
    <div className="p-5 ">
      <div className="heading mb-5 md:flex justify-between">
        <h1 className="text-2xl font-bold  ">Dashboard</h1>

        <div className="md:flex items-center">
          <p className="md:mr-4 mt-2 text-xl ">
            Ostello Business Account Status :{" "}
            <span className="text-[#239B56]">
              {" "}
              {instituteDetails?.accountplan?.toUpperCase().split("_")[0]}
            </span>
          </p>

          {instituteDetails?.accountplan === "free_plan" ? (
            <button
              onClick={() => {
                handleOpen();
              }}
              className=" py-3  px-4 mt-2 bg-primary rounded-3xl text-white"
            >
              Upgrade Now
            </button>
          ) : (
            <button
              onClick={() => {
                // handleOpen();
              }}
              className=" py-3  px-4 mt-2 bg-primary rounded-3xl text-white"
            >
              Upgraded
            </button>
          )}
        </div>
      </div>

      <HeaderCard revenueData={revenueData}></HeaderCard>

      <div className=" grid grid-cols-6 gap-6 ">
        <div className=" col-span-6 lg:col-span-4">
          <Charts
            {...{
              // datesData,
              merchantAnalyticsData,
              dates,
              visitInstitute,
              knowInstitute,
              exploreCourses,
              researchFaculty,
              watchVideos,
              handleStats,
            }}
          ></Charts>
        </div>
        <div className=" col-span-6 lg:col-span-2 bg-white rounded-2xl  ">
          <PieChart revenueData={revenueData}></PieChart>
        </div>
      </div>
      <div className=" grid grid-cols-6 gap-6 mt-4  ">
        <div className=" col-span-6 lg:col-span-4">
          <RecentOrder revenueData={revenueData}></RecentOrder>
        </div>
        <div
          style={{ height: "360px" }}
          className=" thin-scroll h-65  col-span-6 lg:col-span-2  bg-white p-4 rounded-2xl "
        >
          <div className="heading mb-1">
            <h1 style={{ fontWeight: "700", fontSize: "20px" }}>
              Top Selling Courses
            </h1>
          </div>
          <div className="sm:block hidden overflow-y-scroll h-60 ">
            {data
              .map((d, idx) => (
                <div key={idx} className="">
                  <div className=" flex justify-between items-center mt-5">
                    <div className="flex items-center">
                      <img
                        src={img1.src}
                        style={{
                          height: "95px",
                          width: "95px",
                          borderRadius: "8px",
                        }}
                        className="share-image"
                        alt=""
                      />
                      <div className="texts ml-4">
                        <h2 className="text-base mb-1">{d.name}</h2>
                        <Rating
                          className="text-2xl"
                          name="read-only"
                          value={d.rating}
                          readOnly
                        />
                        <h4 className="text-sm font-bold">₹{d.totalAmount}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              ))
              .slice(0, 4)}
          </div>
          <div className="sm:hidden block mb-2">
            {data
              .map((d, idx) => (
                <div key={idx} className="">
                  <div className=" flex justify-between items-center mt-5">
                    <div className="flex items-center">
                      <img
                        src={img1}
                        style={{
                          height: "95px",
                          width: "95px",
                          borderRadius: "8px",
                        }}
                        className="share-image"
                        alt=""
                      />
                      <div className="texts ml-4">
                        <h2 className="text-base mb-1">{d.name}</h2>
                        <Rating
                          className="text-orange/40"
                          emptySymbol="fa fa-star-o "
                          fullSymbol="fa fa-star "
                          initialRating={d?.rating}
                          readonly
                        />
                        <h4 className="text-sm font-bold">₹{d.totalAmount}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              ))
              .slice(0, slice)}
          </div>

          <div className="sm:hidden block">
            {slice === 2 ? (
              <div
                style={{
                  cursor: "pointer",
                  color: "#7D23E0",
                  fontWeight: "500",
                }}
                onClick={() => setSlice(4)}
                className="flex items-center justify-center  font-medium "
              >
                <p className="mr-2">View More</p>
                <AiOutlineArrowDown></AiOutlineArrowDown>
              </div>
            ) : (
              <div
                style={{
                  cursor: "pointer",
                  color: "#7D23E0",
                  fontWeight: "500",
                }}
                onClick={() => setSlice(2)}
                className="flex items-center justify-center  font-medium "
              >
                <p className="mr-2">View Less</p>
                <AiOutlineArrowUp></AiOutlineArrowUp>
              </div>
            )}
          </div>
        </div>
      </div>

      <UpgardeModal open={open} setOpen={setOpen} handleClose={handleClose} />
    </div>
  );
};

export default DashboardHome;
