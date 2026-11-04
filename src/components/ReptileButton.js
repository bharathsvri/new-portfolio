import React from "react";
import SpiderButton from "./SpiderButton";

function ReptileButton({ toggleReptile, isReptileActive, toggleSpider, isSpiderActive }) {
  return (
    <SpiderButton
      toggleSpider={toggleSpider || toggleReptile}
      isSpiderActive={isSpiderActive !== undefined ? isSpiderActive : isReptileActive}
    />
  );
}

export default ReptileButton;
