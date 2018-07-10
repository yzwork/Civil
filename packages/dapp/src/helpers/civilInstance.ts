import { Civil } from "@joincivil/core";
import { CivilTCR } from "../../../core/build/src/contracts/tcr/civilTCR";

let civil: Civil;
let tcr: CivilTCR;

export const setCivil = () => {
  if (!civil) {
    civil = new Civil();
  }
};

export const getCivil = () => {
  if (!civil) {
    setCivil();
  }
  return civil;
};

export const getTCR = () => {
  if (!tcr) {
    setCivil();
  }
  if (!tcr) {
    try {
      tcr = civil.tcrSingletonTrusted();
    } catch (ex) {
      console.error("Unable to get TCR. Check that Metamask is installed and set to Rinkeby.");
    }
  }
  return tcr;
};
