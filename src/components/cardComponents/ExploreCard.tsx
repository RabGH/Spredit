import { buttonVariants } from "@/components/ui/Button";
import { Coffee } from "lucide-react";
import Link from "next/link";

const ExploreCard = () => {
  return (
    <div className="overflow-hidden h-fit reounded-lg border border-gray-200 order-first md:order-last">
      <div className="bg-emerald-100 px-6 py-4">
        <p className="font-semibold py-3 flex items-center gap-1.5">
          <Coffee className="w-4 h-4" />
          Explore
        </p>
      </div>

      <div className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
        <div className="flex justify-between gap-x-4 py-3">
          <p className="text-zinc-500">
            Explore all the communities on Spredit and find new ones that match
            your interests.
          </p>
        </div>
        <Link
          className={buttonVariants({
            className: "w-full mt-4 mb-6",
          })}
          href={"/explore"}
        >
          Explore Communities
        </Link>
      </div>
    </div>
  );
};

export default ExploreCard;
