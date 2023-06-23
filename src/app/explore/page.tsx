import GeneralFeed from "@/components/feedComponents/GeneralFeed";
import HomeCard from "@/components/cardComponents/HomeCard";
import CreateCommunityCard from "@/components/cardComponents/CreateCommunityCard";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Explore() {
  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl">Explore</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 md:grid-rows-1 gap-y-4 md:gap-x-4 py-6">
        {/* @ts-expect-error server component */}
        <GeneralFeed className="row-start-2 md:row-start-auto" />
        <div className="space-y-6 row-start-1 md:row-start-auto">
          <CreateCommunityCard />
          <HomeCard />
        </div>
      </div>
    </>
  );
}
