"use client";

import { useHeader } from "@/providers/HeaderContext";
import Card, { TrophyMeterData } from "./ui/Card";
import { UserPresence } from "@/types/psn";
import { DefinedTrophies } from "@/types/trophies";
import { useEffect } from "react";
import TopBar from "./ui/TopBar";
import SideBar from "./ui/SideBar";
import NavigationBarComponent from "./NavigationBar";

/*

Pontuação troféus oficial PSN

Bronze	15
Silver	30
Gold	90
Platinum	300

*/

function getTrophyPoints(earnedTrophies: DefinedTrophies): number {
  let totalPoints = 0;
  for (const trophyType in earnedTrophies) {
    const earned = earnedTrophies[trophyType as keyof DefinedTrophies];
    const pointsPerTrophy = getPointsPerTrophy(
      trophyType as keyof DefinedTrophies,
    );
    totalPoints += earned * pointsPerTrophy;
  }
  return totalPoints;
}

function getPointsPerTrophy(trophyType: keyof DefinedTrophies): number {
  switch (trophyType) {
    case "bronze":
      return 15;
    case "silver":
      return 30;
    case "gold":
      return 90;
    case "platinum":
      return 300;
    default:
      return 0;
  }
}

function RouteBackComponent() {
  const {
    psnUser,
    show,
    isMobile,
    trophyData,
    setIsMobile,
  } = useHeader();

  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent;

      const isMobileSize = window.innerWidth < 1024;
      const isMobileDevice = /mobile/i.test(ua);

      setIsMobile(isMobileSize || isMobileDevice);

      console.log("isMobile: ", isMobileSize || isMobileDevice);
    };

    window.addEventListener("resize", checkDevice);
    window.addEventListener("load", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("load", checkDevice);
    };
  });

  let profilePicture = "/default-avatar.png";

  const data: TrophyMeterData = {
    psnLevel: trophyData?.trophyLevel || 1,
    definedTrophies: {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    },
    completionPercentage: 0,
    earnedTrophies: trophyData?.earnedTrophies || {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    },
    totalTrophies: trophyData?.totalTrophies || 0,
    trophyPoints: getTrophyPoints(
      trophyData?.earnedTrophies || {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
      },
    ),
  };

  let profileName: string | undefined = "Carregando...";
  let userPresence: UserPresence = {
    lastOnlineDate: new Date("2025-11-22T03:16:30.519Z"),
    onlineStatus: "offline",
    platform: "PS5",
  };

  const avatar =
    psnUser?.fullProfile?.avatars.find((avatar) => avatar.size.includes("xl"))
      ?.url || "/default-avatar.png";

  if (psnUser) {
    profilePicture = avatar;
    profileName = psnUser?.fullProfile?.onlineId;

    if (psnUser?.userPresence) {
      userPresence = psnUser.userPresence;
    }

    if (psnUser?.fullProfile?.personalDetail) {
      profilePicture =
        psnUser?.fullProfile?.personalDetail?.profilePictures?.find((picture) =>
          picture.size.includes("xl"),
        )?.url || "/default-avatar.png";
      profileName =
        psnUser?.fullProfile?.personalDetail?.firstName +
          " " +
          psnUser?.fullProfile?.personalDetail?.lastName ||
        psnUser?.fullProfile?.onlineId;
    }
  }

  const statusColor =
    userPresence?.onlineStatus === "offline"
      ? "border-red-500/20"
      : "border-green-500";
  console.log("🚀 ~ file: RouteBack.tsx ~ line 81 ~ statusColor", statusColor);

  return (
    <div className="h-20 w-screen min-w-screen fixed top-0 left-0 bottom-0 right-0 z-10 pointer-events-none">
      {/* TopBar */}
      <div
        className="absolute -z-1 left-0 top-0 right-0 h-15 
        min-w-screen bg-linear-180 from-black via-80% to-black/0"
      >
        <TopBar
          profilePicture={profilePicture}
          userName={profileName}
          psnUser={psnUser}
          trophyMeter={data}
          lastOnlineDate={userPresence?.lastOnlineDate}
          avatarStatus={userPresence?.onlineStatus}
        />
        
      </div>

      {/* SideBar */}
      <div
        className="absolute hidden lg:block left-3 top-35 
        flex gap-4 items-center justify-center
        bottom-0 w-95 h-screen"
      >
        <SideBar show={true} />
      </div>

      {/* Gamer Card */}
      {isMobile === undefined && (
        <div className="z-100 hidden lg:block text-left fixed -top-12 left-5 -rotate-2 w-96 pr-10 pt-5">
          {show && (
            <>
              <div className={`${show ? "" : "hidden"} flex justify-center`}>
                <Card
                  profilePicture={profilePicture}
                  lastOnlineDate={userPresence?.lastOnlineDate}
                  accountId={psnUser?.accountId}
                  userName={profileName}
                  avatarStatus={userPresence?.onlineStatus}
                  trophyMeter={data}
                ></Card>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}

export default RouteBackComponent;
