import { storiesOf } from "@storybook/react";
import StoryRouter from "storybook-react-router";
import * as React from "react";
import { Hero } from "./Hero";
import { HomepageHero } from "./HomepageHero";
import * as heroImgUrl from "./img-hero-listings.png";

const minDeposit = "1000";

storiesOf("Hero", module)
  .addDecorator(StoryRouter())
  .add("Homepage", () => {
    return (
      <Hero backgroundImage={heroImgUrl}>
        <HomepageHero textUrl="#" buttonUrl="#" minDeposit={minDeposit} />;
      </Hero>
    );
  });
