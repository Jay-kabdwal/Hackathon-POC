type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"
      }
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-[#3A3A3A] sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-[#7A7A7A]">{description}</p>
      )}
    </div>
  );
}
