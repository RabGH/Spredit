import { buttonVariants } from "@/components/ui/Button";
import { ChefHat } from "lucide-react";
import Link from "next/link";

const CreateCommunityCard = () => {
  return (
    <div className="overflow-hidden h-fit reounded-lg border border-gray-200 order-first md:order-last">
      <div className="bg-emerald-100 px-6 py-4">
        <p className="font-semibold py-3 flex items-center gap-1.5">
          <ChefHat className="w-4 h-4" />
          Community
        </p>
      </div>

      <div className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
        <div className="flex justify-between gap-x-4 py-3">
          <p className="text-zinc-500">
            Your personal Spredit homepage. Come here to check in with your
            favorite communities.
          </p>
        </div>
        <Link
          className={buttonVariants({
            className: "w-full mt-4 mb-6",
          })}
          href={"/r/create"}
        >
          Create Community
        </Link>
      </div>
    </div>
  );
};

export default CreateCommunityCard;
