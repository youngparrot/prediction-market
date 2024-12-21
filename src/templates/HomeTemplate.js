"use client";

import Hero from "@/components/Hero";
import { useTranslation } from "react-i18next";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

export default function HomeTemplate() {
  const { t } = useTranslation();

  const items = [
    {
      id: 1,
      element: (
        <Hero
          image={"/images/archers-game.png"}
          name={"Archers"}
          description={
            "Which side will you choose? #Female or #Male? Join your forces #Female / #Male and power them up to fight and win big prizes!"
          }
          link={"/games/archers"}
        />
      ),
    },
    // {
    //   id: 2,
    //   element: (
    //     <Hero
    //       image={"/nfts/mermaid.png"}
    //       name={"Mermaid vs Sea Creatures"}
    //       description={
    //         "Unleash the Battle Beneath the Waves! Dive into Mermaid VS Sea Creatures, the ultimate NFT-powered strategy game where players take sides in an epic underwater clash! Will you champion the graceful Mermaids or align with the fearsome Sea Creatures? The choice is yours, and every move you make shapes the tides of victory."
    //       }
    //       link={"/mints/mermaid"}
    //     />
    //   ),
    // },
  ];

  return (
    <div className="bg-secondary text-white flex flex-col items-center justify-center p-0 md:p-6">
      {/* Grid container */}
      <div className="grid grid-cols-1 gap-6 w-full">
        <Carousel
          showThumbs={false}
          infiniteLoop={true}
          autoPlay={true}
          interval={5000}
          showStatus={false}
          className="w-full"
        >
          {items.map((slide, index) => (
            <div key={index} className="flex items-center">
              {slide.element}
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
