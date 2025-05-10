import { Bell } from "lucide-react";
import React from "react";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const Header = ({ title, subtitle, rightElement }: HeaderProps) => {
  return (
    <div className="header">
      <div>
        <h1 className="header__title">{title}</h1>
        <p className="header__subtitle">{subtitle}</p>
      </div>
      <div className="dashboard-navbar__actions">
        <button className="nondashboard-navbar__notification-button">
          <span className="nondashboard-navbar__notification-indicator"></span>
          <Bell className="nondashboard-navbar__notification-icon" />
        </button>
        <UserButton
          appearance={{
            baseTheme: dark,
            elements: {
              userButtonOuterIdentifier: "text-customgreys-dirtyGrey",
              userButtonBox: "scale-90 sm:scale-100",
            },
          }}
          showName={true}
          userProfileMode="navigation"
          userProfileUrl={"/user/profile"}
        />
      </div>
    </div>
  );
};

export default Header;