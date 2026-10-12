import Image from "next/image";
import Link from "next/link";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center"
      aria-label="Manaslu Guitar home"
    >
      <Image
        src={inverse ? "/images/manaslu-logo-light.png" : "/images/manaslu-logo-dark.png"}
        alt="Manaslu Guitar"
        width={800}
        height={320}
        sizes="(max-width: 640px) 150px, 190px"
        className="h-auto w-[150px] sm:w-[190px]"
      />
    </Link>
  );
}
