import {
  DownOutlined,
  PlayCircleFilled,
  ShareAltOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Carousel from "react-elastic-carousel";
import toast from "react-hot-toast";
import { BsCheckCircle } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import imgProto from "../../../assets/images/icons/img.svg";
import videoImage from "../../../assets/images/videoImg.png";
import useScreenWidth from "../../../components/hooks/useScreenWidth";
import VideoPlayer from "../../../components/VideoPlayer";
import {
  ArrowRightOutlined,
  HeartFilled,
  HeartOutlined,
  StarFilled,
} from "@ant-design/icons";
import {
  authSelector,
  getUser,
  setAuthModalState,
} from "../../../redux/slices/authSlice";
import {
  selectCourse,
  setSingleCourse,
} from "../../../redux/slices/courseSlice";
import { getOrderResponse } from "../../../redux/slices/orderSlice";
import {
  postUserAnalytics,
  selectUserAnalytics,
  setVisitCourseOffered,
} from "../../../redux/slices/UserAnalytics";
import { ACCESS_TOKEN, host, OWNER_ID } from "../../../utils/constant";
import { isEmpty, isJsonParsable } from "../../../utils/utils";
import Modal from "../../UI/Modal/Modal";
import AuthModal from "../HomeLanding/Header/Navbar/AuthModal";
import PaymentDetails from "../Payment/section/payment_details";
import CourseHeader from "./CourseHeader";
import SharePopup from "../../UI/SharePopup";
import { GoChevronDown } from "react-icons/go";
import hybridIndicator from "../../../assets/images/icons/hybridIndicator.svg";
import offlineIndicator from "../../../assets/images/icons/offlineIndicator.svg";
import onlineIndicator from "../../../assets/images/icons/onlineIndicator.svg";
import { AiFillVideoCamera } from "react-icons/ai";

const Courses = ({
  currentInstitute,
  currentInstituteCourses,
  ipAddress,
  setCurrentCourseData,
}) => {
  const { userData } = useSelector(authSelector);
  const [selected, setSelected] = useState("");
  const [courseSelected, setCourseSelected] = useState("");
  const [courseSelectedId, setCourseSelectedId] = useState("");
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  const { visitCourseOffered, userLocation } = useSelector(selectUserAnalytics);
  const { currentCourse } = useSelector(selectCourse);
  const { grossprice, effectiveprice, discountprice, coupon } = currentCourse;
  let discount = grossprice - effectiveprice;
  let couponPrice = 0;
  if (applied) {
    couponPrice = discountprice * (coupon?.discountrate / 100);
  }
  let total = Math.floor(grossprice - discount - couponPrice);

  const [courseTypeShow, setCourseTypeShow] = useState(false);
  const [courseType, setCourseType] = useState("regular_course");

  const [currentInstituteCoursesData, setCurrentInstituteCoursesData] =
    useState([]);

  useEffect(() => {
    if (
      currentInstituteCourses.filter((a) => a?.coursetype === "regular_course")
        .length > 0
    ) {
      setCourseType("regular_course");
    } else {
      setCourseType("crash_course");
    }
  }, [currentInstituteCourses]);

  useEffect(() => {
    if (currentInstituteCourses?.length) {
      if (courseType === "regular_course") {
        setCurrentInstituteCoursesData(
          currentInstituteCourses?.filter(
            (a) => a?.coursetype !== "crash_course"
          )
        );
      } else {
        setCurrentInstituteCoursesData(
          currentInstituteCourses?.filter((a) => a?.coursetype === "crash_course")
        );
      }
    }
  }, [currentInstituteCourses, courseType]);

  console.log(currentInstituteCoursesData, courseType);

  const handleApplied = () => {
    setApplied(!applied);
  };
  const handleModalClose = () => {
    setOpenModal(false);
  };
  const handleModalOpen = () => {
    setOpenModal(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };
  const handleSelect = (e) => {
    setSelected(e);
    setError("");
  };
  const [courseData, setCourseData] = useState({});

  const getClassType = (num) => {
    if (num === 1) {
      return "Hybrid";
    }
    if (num === 2) {
      return "Online";
    }
    if (num === 3) {
      return "Offline";
    }
  };

  const handelCourseSelect = (e) => {
    console.log(e);
    setCourseData(e);
    setCourseSelected(e?.name);
    setCourseSelectedId(e?.id);
    setError("");
    const currentCourse = currentInstituteCoursesData?.filter((e) =>
      e.name.includes(courseSelected)
    );
    let currentTime = moment().format();
    let previousTime = moment(visitCourseOffered?.timeStamps);
    let diff = moment(currentTime).diff(previousTime, "seconds");
    const data = {
      activity_type: "explore_courses",
      payload: {
        instituteid: currentInstitute?.id,
        ipaddress: ipAddress,
        courseid: currentCourse[0]?.id,
        institute_name: currentInstitute?.name,
        course_name: currentCourse[0]?.name,
      },
    };
    if (isAuthenticated && !ipAddress) {
      data.payload.userid = userData?.id;
      data.payload.user_name = userData?.name;
    }
    if (userLocation?.latitude !== "") {
      data.location = {
        longitude: userLocation?.longitude?.toString(),
        latitude: userLocation?.latitude?.toString(),
      };
    } else {
      data.location = null;
    }

    if (visitCourseOffered?.courseId === currentCourse?.[0]?.id && diff > 10) {
      dispatch(postUserAnalytics(data));
    } else {
      dispatch(postUserAnalytics(data));
      dispatch(
        setVisitCourseOffered({
          courseId: currentCourse[0]?.id,
          timeStamps: currentTime,
        })
      );
    }
  };

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [course, setCourse] = useState([]);

  // console.log(currentCourse,  courseSelected, currentInstitute);

  useEffect(() => {
    const courseClasses = [];
    const courseSubject = [];
    currentInstituteCoursesData
      ?.slice()
      .sort((a, b) => b?.videos?.length - a?.videos?.length)
      .forEach((c) => {
        c.category.subjects?.forEach((cl) => {
          courseSubject.push(cl);
        });

        if (
          c?.category?.name === "Medical" ||
          c?.category?.name === "Engineering" ||
          c?.category?.name === "Graduation" ||
          c?.category?.name === "Spoken English" ||
          c?.category?.name === "Academics"
        ) {
          if (c?.category?.name === "Academics") {
            c.category.classes?.forEach((cl) => {
              courseClasses.push(cl);
            });
          }
          if (c?.category?.name === "Medical") {
            courseClasses.push(c?.category?.name);
          }
          if (c?.category?.name === "Engineering") {
            courseClasses.push(c?.category?.name);
          }
          if (c?.category?.name === "Graduation") {
            courseClasses.push(c?.category?.name);
          }
          if (c?.category?.name === "Spoken English") {
            courseClasses.push(c?.category?.name);
          }
        } else {
          courseClasses.push(c?.category?.name);
        }
      });
    console.log(
      courseClasses.sort((a, b) => a?.split("Class")[1] - b?.split("Class")[1])
    );
    let uniqueClass = [
      ...new Set(
        courseClasses.sort(
          (a, b) => a?.split("Class")[1] - b?.split("Class")[1]
        )
      ),
    ];
    let uniqueSub = [...new Set(courseSubject)];

    setClasses(uniqueClass);
    setSubjects(uniqueSub);
    setSelected(uniqueClass[0]);
  }, [currentInstituteCoursesData]);

  useEffect(() => {
    const recentData = currentInstituteCoursesData
      ?.slice()
      .sort((a, b) => b?.videos?.length - a?.videos?.length)[0];

    setRecentCourse(recentData);

    if (recentData?.category?.name === "Academics") {
      setSelected(recentData?.category?.classes[0]);
    } else {
      setSelected(recentData?.category?.name);
    }

    if (
      recentData?.category?.name !== "Engineering" &&
      recentData?.category?.name !== "Medical"
    ) {
      setCourseSelected(recentData?.name);
      setCourseSelectedId(recentData?.id);
    }
    else{
      setCourseSelected(recentData?.category?.name);
      setCourseSelectedId(recentData?.id);
    }

    
  console.log(recentData, 'ravi', currentInstituteCoursesData, currentInstituteCourses);
  
  }, [currentInstituteCoursesData]);


  const [recentCourse, setRecentCourse] = useState();

  console.log(recentCourse, currentInstituteCoursesData);

  useEffect(() => {
    const sub = currentInstituteCoursesData
      ?.slice()
      .sort((a, b) => b?.videos?.length - a?.videos?.length)
      .filter((e) => e.category.classes.includes(selected));
    const sub2 = currentInstituteCoursesData
      ?.slice()
      .sort((a, b) => b?.videos?.length - a?.videos?.length)
      .filter((e) => e?.category?.name.includes(selected));

    const sub3 = sub?.concat(sub2);

    const courseName = [];
    const fullCourse = [];

    sub3?.forEach((c) => {
      if (c?.category?.name === "Medical") {
        courseName.push(c?.name);
        fullCourse.push(c);
      } else if (c?.category?.name === "Engineering") {
        courseName.push(c?.name);
        fullCourse.push(c);
      } else if (
        c?.category?.name !== "Engineering" &&
        c?.category?.name !== "Medical"
      ) {
        courseName.push(c.name);
        console.log(c.name);
        fullCourse.push(c);
      }
    });

    console.log(courseName, fullCourse[0], sub3);
    setCourse(fullCourse);
    setCourseSelected(courseName[0]);
    setCourseData(fullCourse[0]);
  }, [currentInstituteCoursesData, selected]);

  useEffect(() => {
    const sub = currentInstituteCoursesData?.filter((e) =>
      e.category.classes.includes(selected)
    );
    const sub2 = currentInstituteCoursesData?.filter((e) =>
      e.category.name.includes(selected)
    );

    const recentCourse1 = sub?.find((a) => a?.id === courseData?.id);
    const recentCourse2 = sub2?.find((a) =>
      a?.category?.exams?.find((a) => courseData?.name?.includes(a))
    );
    const recentCourse3 = sub2?.find((a) => a?.id === courseData?.id);

    console.log(
      sub2,
      recentCourse3,
      selected,
      recentCourse1,
      sub,
      sub2,
      courseSelected
    );

    if (recentCourse2) {
      setRecentCourse(recentCourse2);
      dispatch(setSingleCourse(recentCourse2?.id));
    } else if (recentCourse3) {
      setRecentCourse(recentCourse3);
      dispatch(setSingleCourse(recentCourse3?.id));
    } else {
      setRecentCourse(recentCourse1);
      dispatch(setSingleCourse(recentCourse1?.id));
    }
  }, [
    courseData?.id,
    courseData?.name,
    courseSelected,
    currentInstitute,
    selected,
    dispatch,
  ]);

  console.log(courseSelected);

  useEffect(() => {
    if (recentCourse) {
      setCurrentCourseData(recentCourse);
    }
  }, [recentCourse]);

  useEffect(() => {
    const fetchData = async () => {
      const purchasedCourses = await axios.get(`${host}/course/purchased`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${
            typeof window !== "undefined" &&
            window.localStorage.getItem("ACCESS_TOKEN")
          }`,
        },
      });

      if (!isEmpty(userData)) {
        if (
          purchasedCourses?.data?.courses?.find(
            (item) => item?.course?.id === recentCourse?.id
          )
        ) {
          setPurchased(true);
        } else if (
          userData?.recentlyviewedcourses?.find(
            (item) => item?.id === recentCourse?.id
          )
        ) {
          setReviewed(true);
        } else {
          setPurchased(false);
          setReviewed(false);
        }
      }
    };
    if (ACCESS_TOKEN?.length) {
      fetchData();
    }
  }, [recentCourse?.id, userData]);

  const [overview, setOverview] = useState(true);
  const [content, setContent] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const [offer, setOffer] = useState(false);

  const [activeKey, setActiveKey] = useState(null);

  const [contents, setContents] = useState([]);
  const router = useRouter();
  const { isAuthenticated } = useSelector(authSelector);
  const [loadInactive, setLoadInactive] = useState(false);
  const { screenWidth } = useScreenWidth();

  console.log(course);

  const handlePartialPayment = async (e) => {
    const processing = toast.loading("Processing Please wait ...");

    const data = {
      amount: total * 100,
      min_amount: parseInt(currentCourse?.emi) * 100,
      userid: userData.id,
      description: `Thanks for buying ${recentCourse?.name} course for partial payments of ${recentCourse?.emi} Rs.`,
      notes: {
        courseid: recentCourse?.id,
        userid: userData?.id,
      },
    };
    try {
      const res = await axios.post(`${host}/payments/link`, data, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${
            typeof window !== "undefined" &&
            window.localStorage.getItem("ACCESS_TOKEN")
          }`,
        },
      });

      dispatch(getOrderResponse(res.data));
      let updateUser = [];
      userData?.recentlyviewedcourses?.map((courses) => {
        updateUser.push(courses?.id);
      });
      const updateData = [...updateUser, recentCourse?.id];
      // console.log('update User', updateUser, updateData)
      if (!reviewed) {
        const updated = await axios.patch(
          `${host}/users`,
          {
            id: userData?.id,
            updates: {
              recentlyviewedcourseids: updateData,
            },
          },
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

        if (updated) {
          // console.log(updated)
          toast.success(
            "Order Submitted for emi payments, Thanks for choosing us"
          );
          toast.remove(processing);
          handleModalClose();
          typeof window !== "undefined" &&
            window.open(
              `${res.data?.short_url}`,
              "Popup",
              "location,status,scrollbars,resizable,width=600, height=800"
            );
        } else {
          toast.error("Something went wrong! Try again");
          toast.remove(processing);
          handleModalClose();
        }
      } else {
        toast.success(
          "Order Submitted for emi payments, Thanks for choosing us"
        );
        toast.remove(processing);
        handleModalClose();
        typeof window !== "undefined" &&
          window.open(
            `${res.data?.short_url}`,
            "Popup",
            "location,status,scrollbars,resizable,width=600, height=800"
          );
      }
    } catch (err) {
      // console.log(err)
      toast.error(err.message);
      toast.remove(processing);
      handleModalClose();
    }
    e.preventDefault();
    router.reload();
  };

  useEffect(() => {
    if (!isEmpty(recentCourse)) {
      let videos = recentCourse.videos;
      let images = recentCourse.images;
      setContents(
        []
          .concat(
            videos?.map((item) => {
              return { ...item, type: "video" };
            })
          )
          .concat(
            images?.map((item) => {
              return { ...item, type: "image" };
            })
          )
      );
      return;
    }

    if (!isEmpty(recentCourse?.updatedRequest?.videos) && loadInactive) {
      let videos = recentCourse?.updatedRequest?.videos;
      let images = recentCourse?.updatedRequest?.images;
      setContents(
        []
          .concat(
            videos?.map((item) => {
              return { ...item, type: "video" };
            })
          )
          .concat(
            images?.map((item) => {
              return { ...item, type: "image" };
            })
          )
      );
    }
  }, [currentInstitute, loadInactive, recentCourse]);

  const [semester, setSemester] = useState([]);
  const [otherCourses, setOtherCourse] = useState(false);

  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    axios
      .get(`${host}/coupon/`)
      .then((res) => {
        setCoupons(res.data.message);
      })
      .catch((err) => console.log(err))
      .finally(() => {});
  }, []);

  console.log(recentCourse);

  useEffect(() => {
    if (recentCourse?.syllabus?.length) {
      setSemester(recentCourse?.syllabus[0].unitDesc);
    }
  }, [recentCourse?.syllabus]);

  const [wishListed, setWishListed] = useState(false);

  useEffect(() => {
    if (userData?.wishlist_courses?.length) {
      let found = userData?.wishlist_courses?.find(
        (item) => item?.id === recentCourse?.id
      );
      console.log(found, recentCourse?.id);
      if (found) {
        setWishListed(true);
      } else {
        {
          setWishListed(false);
        }
      }
    }
  }, [recentCourse, userData]);

  const handleWishList = async () => {
    if (!isAuthenticated) {
      return toast.error("Please login to add in wishlist !");
    }

    const config = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    };

    if (!wishListed) {
      let wishlistedData = [];

      userData?.wishlist_courses?.forEach((e) => {
        wishlistedData.push(e?.id);
      });

      let updatedWishlist = wishlistedData?.concat([recentCourse?.id]);

      const data = {
        id: OWNER_ID,
        updates: {
          wishlistcourseids: updatedWishlist,
        },
      };

      console.log(data, updatedWishlist);
      try {
        await axios.patch(`${host}/users/`, data, config);
        toast.success("Successfully Added to whitelist !");
        setWishListed(true);
      } catch (err) {
        console.log(err, "error");
      } finally {
        dispatch(getUser());
      }
    } else {
      let updatedWishlist = userData?.wishlist_courses?.filter(
        (item) => item?.id !== recentCourse?.id
      );
      let wishlistedData = [];

      updatedWishlist?.forEach((e) => {
        wishlistedData.push(e?.id);
      });

      const data = {
        id: OWNER_ID,
        updates: {
          wishlistcourseids: wishlistedData,
        },
      };

      console.log(data);
      try {
        await axios.patch(`${host}/users/`, data, config);
        toast.success("Successfully Removed from whitelist !");
        setWishListed(false);
      } catch (err) {
        console.log(err, "error");
      } finally {
        dispatch(getUser());
      }
    }
  };

  const [priceRef, setPriceRef] = useState("");
  const [effPrice, setEffPrice] = useState(recentCourse?.effectiveprice);
  const [emiPrice, setEmiPrice] = useState(recentCourse?.emi);
  const [grossPrice, setGrossPrice] = useState(recentCourse?.grossprice);
  const [discountPrice, setDiscountPrice] = useState(
    recentCourse?.discountprice
  );
  const [minimumPrice, setMinimumPrice] = useState(recentCourse?.minimumprice);

  useEffect(() => {
    if (priceRef === "yearly") {
      if (recentCourse?.pricingdetails?.yearly) {
        setEffPrice(recentCourse?.pricingdetails?.yearly?.effectiveprice);
        setGrossPrice(recentCourse?.pricingdetails?.yearly?.grossprice);
        setEmiPrice(recentCourse?.pricingdetails?.yearly?.emi);
        setDiscountPrice(recentCourse?.pricingdetails?.yearly?.discountprice);
        setMinimumPrice(recentCourse?.pricingdetails?.yearly?.minimumprice);
      } else {
        setEffPrice(0);
        setGrossPrice(0);
        setEmiPrice(0);
        setDiscountPrice(0);
        setMinimumPrice(0);
      }
    }
    if (priceRef === "halfYearly") {
      if (recentCourse?.pricingdetails?.halfYearly) {
        setEffPrice(recentCourse?.pricingdetails?.halfYearly?.effectiveprice);
        setGrossPrice(recentCourse?.pricingdetails?.halfYearly?.grossprice);
        setEmiPrice(recentCourse?.pricingdetails?.halfYearly?.emi);
        setDiscountPrice(
          recentCourse?.pricingdetails?.halfYearly?.discountprice
        );
        setMinimumPrice(recentCourse?.pricingdetails?.halfYearly?.minimumprice);
      } else {
        setEffPrice(0);
        setGrossPrice(0);
        setEmiPrice(0);
        setDiscountPrice(0);
        setMinimumPrice(0);
      }
    }
    if (priceRef === "monthly") {
      if (recentCourse?.pricingdetails?.monthly) {
        setEffPrice(recentCourse?.pricingdetails?.monthly?.effectiveprice);
        setGrossPrice(recentCourse?.pricingdetails?.monthly?.grossprice);
        setEmiPrice(recentCourse?.pricingdetails?.monthly?.emi);
        setDiscountPrice(recentCourse?.pricingdetails?.monthly?.discountprice);
        setMinimumPrice(recentCourse?.pricingdetails?.monthly?.minimumprice);
      } else {
        setEffPrice(0);
        setGrossPrice(0);
        setEmiPrice(0);
        setDiscountPrice(0);
        setMinimumPrice(0);
      }
    }
    if (priceRef === "oneTime") {
      if (recentCourse?.pricingdetails?.oneTime) {
        setEffPrice(recentCourse?.pricingdetails?.oneTime?.effectiveprice);
        setGrossPrice(recentCourse?.pricingdetails?.oneTime?.grossprice);
        setEmiPrice(recentCourse?.pricingdetails?.oneTime?.emi);
        setDiscountPrice(recentCourse?.pricingdetails?.oneTime?.discountprice);
        setMinimumPrice(recentCourse?.pricingdetails?.oneTime?.minimumprice);
      } else {
        setEffPrice(0);
        setGrossPrice(0);
        setEmiPrice(0);
        setDiscountPrice(0);
        setMinimumPrice(0);
      }
    }
    if (
      priceRef !== "monthly" &&
      priceRef !== "halfYearly" &&
      priceRef !== "yearly" &&
      priceRef !== "oneTime"
    ) {
      setEffPrice(recentCourse?.effectiveprice);
      setGrossPrice(recentCourse?.grossprice);
      setEmiPrice(recentCourse?.emi);
      setDiscountPrice(recentCourse?.discountprice);
      setMinimumPrice(recentCourse?.minimumprice);
    }
    if (
      !recentCourse?.pricingdetails?.yearly?.effectiveprice &&
      !recentCourse?.pricingdetails?.halfYearly?.effectiveprice &&
      !recentCourse?.pricingdetails?.monthly?.effectiveprice &&
      !recentCourse?.pricingdetails?.oneTime?.effectiveprice
    ) {
      // setPriceRef('')
      setEffPrice(recentCourse?.effectiveprice);
      setGrossPrice(recentCourse?.grossprice);
      setEmiPrice(recentCourse?.emi);
      setDiscountPrice(recentCourse?.discountprice);
      setMinimumPrice(recentCourse?.minimumprice);
    }
  }, [
    priceRef,
    recentCourse?.pricingdetails?.yearly,
    recentCourse?.pricingdetails?.halfYearly,
    recentCourse?.pricingdetails?.monthly,
    recentCourse?.pricingdetails?.oneTime,
    recentCourse,
  ]);

  useEffect(() => {
    if (recentCourse?.pricingdetails?.yearly?.grossprice > 0) {
      setPriceRef("yearly");
    } else if (recentCourse?.pricingdetails?.halfYearly?.grossprice > 0) {
      setPriceRef("halfYearly");
    } else if (recentCourse?.pricingdetails?.monthly?.grossprice > 0) {
      setPriceRef("monthly");
    } else if (recentCourse?.pricingdetails?.oneTime?.grossprice > 0) {
      setPriceRef("oneTime");
    }
  }, [
    recentCourse?.pricingdetails?.yearly,
    recentCourse?.pricingdetails?.halfYearly,
    recentCourse?.pricingdetails?.monthly,
    recentCourse?.pricingdetails?.oneTime,
  ]);

  const [dropDownData, setDropDownData] = useState([]);

  useEffect(() => {
    let data = [];
    if (recentCourse?.pricingdetails?.yearly?.grossprice > 0) {
      data.push({
        name: "Yearly",
        value: "yearly",
      });
    }
    if (recentCourse?.pricingdetails?.halfYearly?.grossprice > 0) {
      data.push({
        name: "Half Yearly",
        value: "halfYearly",
      });
    }
    if (recentCourse?.pricingdetails?.monthly?.grossprice > 0) {
      data.push({
        name: "Monthly",
        value: "monthly",
      });
    }
    if (recentCourse?.pricingdetails?.oneTime?.grossprice > 0) {
      data.push({
        name: "One Time",
        value: "oneTime",
      });
    }
    console.log(data, recentCourse?.pricingdetails);
    setDropDownData(data);
  }, [
    recentCourse?.pricingdetails?.yearly?.grossprice,
    recentCourse?.pricingdetails?.halfYearly?.grossprice,
    recentCourse?.pricingdetails?.monthly?.grossprice,
    recentCourse?.pricingdetails?.oneTime?.grossprice,
  ]);

  console.log(dropDownData);

  const [subjectShowing, setSubjectShowing] = useState(false);
  const [classShowing, setClassShowing] = useState(false);

  useEffect(() => {
    document.body.addEventListener("click", removeDropdown);
  }, []);

  const removeDropdown = (e) => {
    setSubjectShowing(false);
    setClassShowing(false);
    setCourseTypeShow(false);
    e.stopPropagation();
  };

  const courseTypeData = [
    {
      name: "Regular Course",
      value: "regular_course",
    },
    {
      name: "Crash Course",
      value: "crash_course",
    },
  ];

  return (
    <>
      <AuthModal
        handleClose={handleClose}
        handleOpen={handleOpen}
        open={open}
      />
      <PaymentModal
        {...{
          handleApplied,
          applied,
          openModal,
          handleModalClose,
          handlePartialPayment,
          courseSelected,
          recentCourse,
          currentInstitute,
          currentInstituteCourses,
          effPrice,
          emiPrice,
          grossPrice,
          discountPrice,
          minimumPrice,
          priceRef,
        }}
      />
      {currentInstituteCourses?.length ? (
        <div className="">
          <p className="md:max-w-[1350px] mx-auto text-[42px] py-5 px-5">
            Courses
          </p>
          <div className="shadow-xl w-full ">
            {currentInstituteCourses.filter(
              (a) => a.coursetype === "crash_course"
            ).length &&
            currentInstituteCourses.filter(
              (a) => a.coursetype !== "crash_course"
            ).length ? (
              <div className="relative  my-1 md:max-w-[1350px] mx-auto text-[42px] py-2 md:px-7 px-5">
                <p
                  onClick={(e) => {
                    setCourseTypeShow(!courseTypeShow);
                    setSubjectShowing(false);
                    setClassShowing(false);
                    e.stopPropagation();
                  }}
                  className="flex  justify-between w-44 items-center  cursor-pointer border-2 border-solid border-[#C4C4C4] rounded-[4px]  p-3 "
                >
                  <p className={` text-[#000000] text-[16px] `}>
                    {courseType
                      ? courseType === "crash_course"
                        ? "Crash Course"
                        : "Regular Course"
                      : "Select Type"}
                  </p>
                  {courseTypeShow ? (
                    <GoChevronDown className="ml-1 text-[16px] rotate-180" />
                  ) : (
                    <GoChevronDown className="ml-1 text-[16px]" />
                  )}
                </p>
                {courseTypeShow ? (
                  <>
                    {/* <div className="arrow  absolute h-[20px]  w-[20px] bg-black rotate-45" id="arrow"/> */}
                    <div className="absolute left-5 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1 divide-y divide-gray/20" role="none">
                        {courseTypeData?.map((element, idx) => {
                          return (
                            <div
                              key={idx}
                              className={`flex ${
                                courseType === element.value
                                  ? "text-primary"
                                  : "text-[#000000]"
                              }   justify-between cursor-pointer  items-center`}
                              onClick={() => {
                                setCourseType(element.value);
                              }}
                            >
                              <p className={`  text-[16px]  px-4 py-2 `}>
                                {element.name}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  ""
                )}
              </div>
            ) : (
              ""
            )}
            <div className="md:flex md:max-w-[1350px] mx-auto px-5">
              <div className="md:w-2/4 md:flex pb-2">
                {/* <select
                  onChange={(e) => handleSelect(e)}
                  value={selected}
                  className={`my-2 form-select   marker:block md:w-[48%] w-full px-4 pr-8 py-2 text-base font-normal text-slate bg-white  bg-no-repeat border-2 border-solid ${
                    error.length === 0 ? "border-light-gray" : "border-red"
                  } rounded-xl  first-letter:transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`}
                >
                  {classes?.map((c, idx) => {
                    return (
                      <option key={idx} className="w-full text-black">
                        {c}
                      </option>
                    );
                  })}
                </select> */}
                {/* <select
                  onChange={(e) => handelCourseSelect(e)}
                  defaultValue={courseSelected}
                  className={`my-2 form-select   marker:block md:w-[48%] md:ml-2 w-full px-4 pr-8 py-2 text-base font-normal text-slate bg-white  bg-no-repeat border-2 border-solid ${
                    error.length === 0 ? "border-light-gray" : "border-red"
                  } rounded-xl  first-letter:transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`}
                >
                  {course?.map((c, idx) => {
                    return (
                      <option
                        value={JSON.stringify(c)}
                        key={idx}
                        className="w-full text-black"
                      >
                        {c.name}
                      </option>
                    );
                  })}
                </select> */}

                <div className="relative  my-1 md:w-[48%] md:ml-2 w-full">
                  <p
                    onClick={(e) => {
                      setSubjectShowing(false);
                      setCourseTypeShow(false);
                      setClassShowing(!classShowing);
                      e.stopPropagation();
                    }}
                    className="flex w-full justify-between   items-center  cursor-pointer border-2 border-solid border-[#C4C4C4] rounded-[4px]  p-3 "
                  >
                    <p className={`  text-[16px] `}>
                      {selected ? selected?.toUpperCase() : "Class"}
                    </p>
                    {classShowing ? (
                      <GoChevronDown className="ml-1 text-[16px] rotate-180" />
                    ) : (
                      <GoChevronDown className="ml-1  text-[16px]" />
                    )}
                  </p>
                  {classShowing ? (
                    <>
                      {/* <div className="arrow  absolute h-[20px]  w-[20px] bg-black rotate-45" id="arrow"/> */}
                      <div className="absolute left-0 z-10 mt-5 w-48 md:ml-2 w-full origin-top-left rounded-[4px] bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-[300px] overflow-y-scroll">
                        <div
                          className="py-1 divide-y divide-gray/20"
                          role="none"
                        >
                          {classes?.map((element, idx) => {
                            return (
                              <div
                                key={idx}
                                className={`flex ${
                                  selected === element
                                    ? "text-primary"
                                    : "text-[#000000]"
                                }   justify-between   cursor-pointer  items-center`}
                                onClick={() => {
                                  handleSelect(element);
                                }}
                              >
                                <p className={`  text-[16px]  px-4 py-2 `}>
                                  {element?.toUpperCase()}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                </div>

                <div className="relative  my-1 md:w-[48%] md:ml-2 w-full">
                  <p
                    onClick={(e) => {
                      setSubjectShowing(!subjectShowing);
                      setCourseTypeShow(false);
                      setClassShowing(false);
                      e.stopPropagation();
                    }}
                    className="flex w-full justify-between   items-center  cursor-pointer border-2 border-solid border-[#C4C4C4] rounded-[4px]  p-3 "
                  >
                    <p className={`  text-[16px] `}>
                      {courseSelected
                        ? courseSelected?.slice(0, 25)?.toUpperCase()
                        : "Subjects"}{" "}
                      {courseSelected?.length > 25 ? "..." : ""}
                    </p>
                    {subjectShowing ? (
                      <GoChevronDown className="ml-1 text-[16px] rotate-180" />
                    ) : (
                      <GoChevronDown className="ml-1  text-[16px]" />
                    )}
                  </p>
                  {subjectShowing ? (
                    <>
                      {/* <div className="arrow  absolute h-[20px]  w-[20px] bg-black rotate-45" id="arrow"/> */}
                      <div className="absolute left-0 z-10 mt-5 w-48 md:ml-2 w-full origin-top-left rounded-[4px] bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-[300px] overflow-y-scroll">
                        <div
                          className="py-1 divide-y divide-gray/20"
                          role="none"
                        >
                          {course?.map((element, idx) => {
                            return (
                              <div
                                key={idx}
                                className={`flex ${
                                  courseSelectedId === element?.id
                                    ? "text-primary"
                                    : "text-[#000000]"
                                }   justify-between cursor-pointer  items-center px-4 py-2 `}
                                onClick={() => {
                                  handelCourseSelect(element);
                                }}
                              >
                                <p className={`  text-[16px]  `}>
                                  {element?.name?.toUpperCase()}
                                </p>
                                {element?.videos?.length ? (
                                  <AiFillVideoCamera className="text-[20px]" />
                                ) : (
                                  ""
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              </div>

              <div className="md:w-2/4 md:px-5">
                <div className="flex justify-between mt-5 md:w-3/4 mx-auto md:text-[26px] text-[20px] ">
                  <p
                    className={`cursor-pointer pb-2 ${
                      overview ? "border-b-2 border-primary" : ""
                    }`}
                    onClick={() => {
                      setOverview(true);
                      setContent(false);
                      setOffer(false);
                    }}
                  >
                    Overview
                  </p>
                  <p
                    className={`cursor-pointer pb-2 ${
                      content ? "border-b-2 border-primary" : ""
                    }`}
                    onClick={() => {
                      setOverview(false);
                      setContent(true);
                      setOffer(false);
                    }}
                  >
                    Course Content
                  </p>
                  <p
                    className={`cursor-pointer pb-2 ${
                      offer ? "border-b-2 border-primary" : ""
                    }`}
                    onClick={() => {
                      setOverview(false);
                      setContent(false);
                      setOffer(true);
                    }}
                  >
                    Offer
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:max-w-[1350px] mx-auto px-5 py-5">
            {overview && (
              <div>
                <div className="grid grid-cols-6 items-center md:px-5">
                  <div
                    className={
                      "  text-justify my-5 md:col-span-3 col-span-6 md:mr-12"
                    }
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-[#464646] text-[20px]  md:text-[26px] font-semibold my-3">
                        Course Overview
                      </p>

                      <div className="flex items-center">
                        <div
                          onClick={() => {
                            handleWishList();
                          }}
                          className={`rounded-full text-2xl h-[50px] w-[50px]  shadow-xl text-gray flex items-center justify-center cursor-pointer p-1 `}
                        >
                          {wishListed ? (
                            <HeartFilled className="text-[#FF0000] flex items-center " />
                          ) : (
                            <HeartOutlined className="flex items-center" />
                          )}
                        </div>
                        <ShareAltOutlined
                          onClick={() => setShareOpen(true)}
                          className="active:opacity-80 ml-2 flex items-center     h-[40px] w-[40px]  rounded-full shadow-sm justify-center cursor-pointer   ring-2  ring-black text-2xl "
                        />
                      </div>
                    </div>
                    <p className="mr-auto px-2 flex mb-2 space-x-2 uppercase text-[14px] ">
                      {
                        <img
                          src={
                            recentCourse?.classtype === 1
                              ? hybridIndicator.src
                              : recentCourse?.classtype === 2
                              ? onlineIndicator.src
                              : offlineIndicator.src
                          }
                          alt=""
                        />
                      }
                      <span>
                        {getClassType(recentCourse?.classtype)} Course
                      </span>
                    </p>
                    {recentCourse?.description?.length && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: recentCourse?.description,
                        }}
                      ></div>
                    )}

                    <div className=" mt-5 md:flex hidden justify-between">
                      <div>
                        {recentCourse?.pricingdetails?.yearly ||
                        recentCourse?.pricingdetails?.halfYearly ||
                        recentCourse?.pricingdetails?.monthly ||
                        recentCourse?.pricingdetails?.oneTime ? (
                          <select
                            onChange={(e) => {
                              setPriceRef(e.target.value);
                            }}
                            value={priceRef}
                            className={` form-select   marker:block w-full px-4 py-3   text-slate bg-[#F2E9FC] bg-clip-padding bg-no-repeat text-xl font-bold  rounded-md   first-letter:transition ease-in-out m-0 `}
                          >
                            <option
                              className=""
                              selected
                              hidden
                              value=""
                              disabled
                            >
                              Choose Price Ref
                            </option>

                            {dropDownData?.map((a, idx) => {
                              return (
                                <option key={idx} className="" value={a?.value}>
                                  {a?.name}
                                </option>
                              );
                            })}
                          </select>
                        ) : (
                          ""
                        )}

                        <div className="flex items-center">
                          <p className="text-[36px] font-bold mr-3">
                            Rs. {effPrice || 0}
                          </p>
                          <del className=" text-[rgba(211,39,54,.7)] text-[18px]">
                            Rs.{grossPrice || 0}
                          </del>
                        </div>
                      </div>

                      <div>
                        <a
                          href="#enquireSection"
                          className=" px-5 py-2 bg-black block rounded-md mb-3 text-white active:opacity-80 text-[18px] "
                        >
                          Enquire Now
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-3 col-span-6 ">
                    <Carousel
                      itemsToShow={1}
                      showArrows={
                        screenWidth > 768 && contents?.length > 1 ? true : false
                      }
                      pagination={false}
                      renderPagination={({ pages, activePage, onClick }) => {
                        return (
                          <div className="flex items-center space-x-2 ">
                            {pages?.map((page, i) => {
                              const isActivePage = activePage === page;
                              return (
                                <div
                                  className={`cursor-pointer  h-2 rounded-lg my-5 transition-all duration-500 ease-in-out ${
                                    isActivePage
                                      ? "bg-white w-28 "
                                      : "bg-gray/20 w-6"
                                  }`}
                                  key={i}
                                  onClick={() => onClick(page)}
                                  // active={isActivePage}
                                />
                              );
                            })}
                          </div>
                        );
                      }}
                    >
                      {contents?.map((item, i) => (
                        <div
                          key={i}
                          className="video_container w-full md:w-[600px]"
                        >
                          {item.type === "video" ? (
                            <div className="border relative border-white rounded-xl overflow-hidden h-fit aspect-video">
                              <VideoPlayer
                                thumbnailURL={`https://cdn.ostello.co.in/${item.thumbnail.key}`}
                                videoURL={`https://cdn.ostello.co.in/${item.video.key}`}
                              />
                              <div
                                onClick={() => router.push(slug + "/gallery")}
                                className=" group absolute top-2 right-2 md:top-5 md:right-5 p-3 bg-white border-solid border-primary border flex rounded-lg gap-2 transition-all ease-in-out duration-30 cursor-pointer"
                              >
                                <img
                                  src={imgProto.src}
                                  className="w-[10px] text-primary"
                                  alt=""
                                />
                                <p className="text-[#414141] hidden group-hover:block   ">
                                  See more
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="border relative border-white rounded-xl overflow-hidden h-fit">
                              <img
                                src={`https://cdn.ostello.co.in/${item.key}`}
                                className="w-full"
                                alt=""
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      {isEmpty(contents) && (
                        <>
                          {[1].map((item, i) => (
                            <div key={i} className="video_container">
                              <div className="relative">
                                <img
                                  src={videoImage.src}
                                  className=" w-full xl:w-[700px] "
                                  alt=""
                                />
                                <PlayCircleFilled
                                  className="
                            text-black/90
                            absolute
                            text-6xl cursor-pointer active:opacity-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:scale-110 duration-300"
                                />
                                <div
                                  onClick={() => router.push(slug + "/gallery")}
                                  className=" group absolute top-5 right-5 md:top-10 md:right-10 p-3 bg-white flex rounded-lg gap-2 transition-all ease-in-out duration-300  cursor-pointer"
                                >
                                  <img
                                    src={imgProto.src}
                                    className="w-[10px] text-primary"
                                    alt=""
                                  />
                                  <p className="text-[#414141] hidden group-hover:block   ">
                                    See more
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </Carousel>
                  </div>
                </div>
                <div className="text-center mt-4 md:hidden block  justify-between">
                  {recentCourse?.pricingdetails?.yearly ||
                  recentCourse?.pricingdetails?.halfYearly ||
                  recentCourse?.pricingdetails?.monthly ||
                  recentCourse?.pricingdetails?.oneTime ? (
                    <select
                      onChange={(e) => {
                        setPriceRef(e.target.value);
                      }}
                      value={priceRef}
                      className={` form-select   marker:block w-full px-4 py-3 mb-3  text-slate bg-[#F2E9FC] bg-clip-padding bg-no-repeat text-xl font-bold  rounded-md   first-letter:transition ease-in-out m-0 `}
                    >
                      <option className="" selected hidden value="" disabled>
                        Choose Price Ref
                      </option>
                      {dropDownData?.map((a, idx) => {
                        return (
                          <option key={idx} className="" value={a?.value}>
                            {a?.name}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    ""
                  )}

                  <div className="flex items-center justify-center mb-3">
                    <p className="text-[36px] font-bold mr-3">
                      Rs. {effPrice || 0}
                    </p>
                    <del className=" text-[rgba(211,39,54,.7)] text-[18px]">
                      Rs.{grossPrice || 0}
                    </del>
                  </div>
                  <div>
                    <a
                      href="#enquireSection"
                      className=" px-5 py-2 bg-black block rounded-md mb-3 text-white active:opacity-80 text-[18px] "
                    >
                      Enquire Now
                    </a>
                  </div>
                </div>
              </div>
            )}

            {content && (
              <section className="divide-y divide-gray/20 ">
                <div className="">
                  <p className=" text-[28px]  font-semibold py-5 px-5">
                    {recentCourse?.name} - {selected}
                  </p>
                </div>
                <div className="md:flex">
                  <div className="md:bg-[#F9F5FF] md:w-3/12 py-5 md:px-8">
                    {/* <div
                  onClick={() => {
                    setSemester1(!semester1)
                    setOtherCourse(false)
                  }}
                  className='flex items-center border-2 p-2 rounded-xl border-[#BBBBBB]  md:p-0 md:border-0 justify-between cursor-pointer'
                >
                  <p className='text-[24px] font-semibold'>Semester 1</p>
                  <DownOutlined
                    className={` transition-all text-[#475467] ml-2 duration-300 ease-in-out ${
                      semester1 && 'rotate-180'
                    } `}
                  />
                </div> */}

                    {recentCourse?.syllabus?.length
                      ? recentCourse?.syllabus?.map((item, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setSemester(item?.unitDesc);
                              setOtherCourse(false);
                              setActiveKey(i === activeKey ? null : i);
                            }}
                            className="flex items-center border-2 p-2 my-3 rounded-xl border-[#BBBBBB]  md:p-0 md:border-0 justify-between cursor-pointer"
                          >
                            <p className="text-[20px] font-semibold">
                              {item?.semester}
                            </p>
                            <DownOutlined
                              className={` transition-all text-[#475467] ml-2 duration-300 ease-in-out ${
                                activeKey === i && "rotate-180"
                              } `}
                            />
                          </div>
                        ))
                      : ""}

                    {/* {semester1 && (
                  <div className='mt-3 ml-3 md:ml-0'>
                    <p
                      onClick={() => {
                        setTool1(true)
                        setTool2(false)
                        setTool3(false)
                        setTool4(false)
                      }}
                      className='text[18px] text-[#475467] mt-2 cursor-pointer'
                    >
                      Math tools
                    </p>
                    <p
                      onClick={() => {
                        setTool1(false)
                        setTool2(true)
                        setTool3(false)
                        setTool4(false)
                      }}
                      className='text[18px] text-[#475467] mt-2 cursor-pointer'
                    >
                      Units & dimension
                    </p>
                    <p
                      onClick={() => {
                        setTool1(false)
                        setTool2(false)
                        setTool3(true)
                        setTool4(false)
                      }}
                      className='text[18px] text-[#475467] mt-2 cursor-pointer'
                    >
                      Experimental physics
                    </p>
                    <p
                      onClick={() => {
                        setTool1(false)
                        setTool2(false)
                        setTool3(false)
                        setTool4(true)
                      }}
                      className='text[18px] text-[#475467] mt-2 cursor-pointer'
                    >
                      Laboratory Experiments
                    </p>
                  </div>
                )} */}

                    {/* <div
                  onClick={() => {
                    // setSemester(false)
                    setOtherCourse(!otherCourses)
                  }}
                  className='flex items-center border-2 p-2 rounded-xl border-[#BBBBBB]  md:p-0 md:border-0 justify-between cursor-pointer mt-4'
                >
                  <p className='text-[24px] font-semibold'>Other Courses </p>
                  <DownOutlined
                    className={` transition-all text-[#475467] ml-2 duration-300 ease-in-out ${
                      otherCourses && 'rotate-180'
                    } `}
                  />
                </div> */}
                  </div>

                  <div className="bg-white md:w-9/12 py-5 md:px-8">
                    {recentCourse?.syllabus?.length
                      ? semester?.map((item, i) => (
                          <div
                            key={i}
                            className="w-full my-2  mx-auto "
                            onClick={() =>
                              setActiveKey(i === activeKey ? null : i)
                            }
                          >
                            <div
                              style={{
                                background: " #F9FAFB",

                                border: "1px solid #D0D5DD",
                              }}
                              className=" flex justify-between rounded-md cursor-pointer active:opacity-75 px-3 py-4   "
                            >
                              <div className="flex space-x-2 justify-center items-center ml-2 text-md md:text-xl  ">
                                <p className="text-[#6941C6] w-10 h-10 rounded-full flex items-center justify-center bg-[#F4EBFF]">
                                  {i + 1}
                                </p>

                                <p className="text-[#475467]">{item?.unit}</p>
                              </div>
                              <div className="md:flex space-x-2 items-center  hidden">
                                {/* <p className="text-md">
                              {item.lectures} lectures
                            </p>
                            .<p className="text-md">{item.hours} hours</p> */}
                                <DownOutlined
                                  className={`flex justify-center transition-all text-[#475467] duration-300 ease-in-out ${
                                    activeKey === i && "rotate-180"
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="">
                              {/* <p
                                className={
                                  activeKey === i
                                    ? "text-black  p-2 rounded-lg md:text-lg mt-1 md:ml-10 mb-5 "
                                    : "hidden"
                                }
                              >
                                {item?.description.split("\n").map((r, idx) => (
                                  <p key={idx}>{r}</p>
                                ))}
                              </p> */}
                              <div
                                className={
                                  activeKey === i
                                    ? "text-black  p-2 rounded-lg md:text-lg mt-1 md:ml-10 mb-5 "
                                    : "hidden"
                                }
                                dangerouslySetInnerHTML={{
                                  __html: item?.description,
                                }}
                              ></div>
                            </div>
                          </div>
                        ))
                      : ""}

                    <div className="text-center mt-3">
                      {reviewed ? (
                        <button
                          onClick={async (e) => {
                            setOpenModal(true);
                          }}
                          className=" px-5 py-2 bg-black rounded-md mb-3 text-white active:opacity-80 text-[18px] "
                        >
                          Reviewed
                        </button>
                      ) : purchased ? (
                        <button className=" px-5 py-2 bg-primary rounded-md mb-3 text-white active:opacity-80 text-[18px] ">
                          Enrolled
                        </button>
                      ) : (
                        <button
                          onClick={async (e) => {
                            if (!isAuthenticated) {
                              setOpen(true);
                              dispatch(setAuthModalState(1));
                            } else {
                              // handlePayment(e)
                              setOpenModal(true);
                            }
                          }}
                          className=" px-5 py-2 bg-black rounded-md mb-3 text-white active:opacity-80 text-[18px] "
                        >
                          Reserve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
            {offer && (
              <section className="divide-y divide-gray/20 ">
                <div className="">
                  <p className="text-[36px] font-semibold py-5 px-5">
                    Exciting Offer
                  </p>
                </div>
                <div className="py-10 px-5">
                  <div className="grid md:grid-cols-2 gap-10 ">
                    {/* {adminSingleCourse?.coupon.map((elementInArray, index) => ( */}
                    <div
                      className="p-3"
                      // key={index}
                      style={{
                        background: "#F9FAFB",
                        border: "1.53901px solid #D0D5DD",
                        borderRadius: "12.3121px",
                      }}
                    >
                      <div className="flex justify-between">
                        <div className="md:w-1/12 w-2/12">
                          <p className="text-[#7D23E0] text-bold text-[18px] flex items-center justify-center bg-[#F4EBFF] w-10 h-10 rounded-full">
                            %
                          </p>
                        </div>
                        <div className="md:w-11/12 w-10/12">
                          <p className="text-[#475467] text-[22px] font-bold mb-3">
                            {currentCourse?.coupon?.discountrate}% OFF upto $
                            {currentCourse?.coupon?.maxdiscountprice}
                          </p>
                          <p className={`text-2xl font-medium`}>
                            {currentCourse?.coupon?.couponcode}
                          </p>
                          <p className="text-[#475467] text-[20px]  mb-3">
                            Valid on total value of items worth Rs.{" "}
                            {currentCourse?.coupon?.minimumprice}
                          </p>
                          <p className="text-[22px] text-[#7D23E0] font-bold">
                            Redeem
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* ))} */}
                  </div>
                  <div className="text-center mt-10">
                    {reviewed ? (
                      <button
                        onClick={async (e) => {
                          setOpenModal(true);
                        }}
                        className=" px-5 py-2 bg-black rounded-md mb-3 text-white active:opacity-80 text-[18px] "
                      >
                        Reviewed
                      </button>
                    ) : purchased ? (
                      <button
                        // onClick={async (e) => {
                        //   if (!isAuthenticated) {
                        //     setOpen(true)
                        //     dispatch(setAuthModalState(1))
                        //   } else {
                        //     handlePayment(e)
                        //   }
                        // }}
                        className=" px-5 py-2 bg-primary rounded-md mb-3 text-white active:opacity-80 text-[18px] "
                      >
                        Enrolled
                      </button>
                    ) : (
                      <button
                        onClick={async (e) => {
                          if (!isAuthenticated) {
                            setOpen(true);
                            dispatch(setAuthModalState(1));
                          } else {
                            // handlePayment(e)
                            setOpenModal(true);
                          }
                        }}
                        className=" px-5 py-2 bg-black rounded-md mb-3 text-white active:opacity-80 text-[18px] "
                      >
                        Reserve
                      </button>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="py-10">
            <CourseHeader
              {...{
                recentCourse,
                handleModalOpen,
                reviewed,
                purchased,
                emiPrice,
                effPrice,
                priceRef
              }}
              // recentCourse={recentCourse}
              // handlePayment={handlePayment}
            />
          </div>
          <SharePopup
            TextToCopy={
              typeof window !== "undefined" &&
              `${window.location.href}/course/${recentCourse?.id}/${recentCourse?.name}`
            }
            open={shareOpen}
            onClose={() => setShareOpen(false)}
          />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Courses;

export const PaymentModal = ({
  openModal,
  handleModalClose,
  currentInstitute,
  handlePartialPayment,
  courseSelected,
  handleApplied,
  applied,
  currentInstituteCourses,
  effPrice,
  emiPrice,
  grossPrice,
  discountPrice,
  minimumPrice,
  priceRef,
}) => {
  const currentCourse = currentInstituteCourses?.filter((e) =>
    e.name.includes(courseSelected)
  );
  const [success, setSuccess] = useState(false);
  const handleSuccess = () => {
    setSuccess(true);
  };
  return (
    <div className="bg-white">
      <Modal
        closeOnOutsideClick={true}
        onClose={handleModalClose}
        open={openModal}
      >
        <PaymentDetails
          currentInstitute={currentInstitute}
          handlePartialPayment={handlePartialPayment}
          handleModalClose={handleModalClose}
          handleSuccess={handleSuccess}
          handleApplied={handleApplied}
          applied={applied}
          success={success}
          effPrice={effPrice}
          emiPrice={emiPrice}
          grossPrice={grossPrice}
          discountPrice={discountPrice}
          minimumPrice={minimumPrice}
          priceRef={priceRef}
        />
      </Modal>
    </div>
  );
};
