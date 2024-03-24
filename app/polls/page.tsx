import {kv} from "@vercel/kv";
import {Poll} from "@/app/types";
import Link from "next/link";

const SEVEN_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 7;

async function getPolls() {
    try {
        let pollIds = await kv.zrange("polls_by_date", Date.now(), Date.now() - SEVEN_DAYS_IN_MS, {byScore: true, rev: true, count: 100, offset: 0});

        if (!pollIds.length) {
            return [];
        }

        let multi = kv.multi();
        pollIds.forEach((id) => {
            multi.hgetall(`poll:${id}`);
        });

        let items: Poll[] = await multi.exec();
        return items.map((item) => {
            return {...item};
        });
    } catch (error) {
        console.error(error);
        return [];
    }
}

export default async function Page() {
    const polls = await getPolls();
    console.log(polls, "in page fileee");
    return (
        <div className="flex flex-col items-center justify-center">
            <main className="flex flex-col items-start justify-center flex-1 px-4 sm:px-20 ">
                <h1 className="text-lg sm:text-2xl font-bold mb-2">
                    Created Posts
                </h1>
                <div className="flex-wrap items-start justify-center w-full my-8 bg-white rounded-md">
                    {
                        polls.map((poll) => {
                        // returns links to poll ids
                        return (<div key={poll.id}>
                            <a href={`/polls/${poll.id}`} className=" p-2 rounded-md m-2">
                                <p className="text-md bg-green-400 rounded-md p-2 sm:text-xl">{poll.title}</p>
                            </a>
                        </div>)
                        })
                    }
                </div>
                <Link href="/">
                    <button className="bg-blue-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded">
                        Create Poll
                    </button>
                </Link>
            </main>
        </div>
    );
}