// Import necessary components from Next.js
import Image from "next/image";

export default function Hero({ image, name, description, link }) {
  return (
    <section className="flex flex-col md:flex-row gap-4 items-center justify-center px-2 py-8 md:p-16">
      {/* Image Section */}
      <div className="flex-shrink-0">
        <Image
          src={image} // Replace with your image path
          alt="Hero Image"
          width={500}
          height={500}
          className="object-cover"
        />
      </div>

      {/* Content Section */}
      <div>
        <h1 className="text-4xl font-bold text-highlight mb-4">{name}</h1>
        <p className="text-lg text-metallic">{description}</p>
        <div className="flex justify-center mt-4">
          <a
            href={link}
            className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            PLAY NOW
          </a>
        </div>
      </div>
    </section>
  );
}
