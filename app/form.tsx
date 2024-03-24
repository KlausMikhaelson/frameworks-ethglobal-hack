"use client";

import clsx from "clsx";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { redirectToPolls, savePoll, votePoll } from "./actions";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";
import { Poll } from "./types";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2Yzc0ODU2ZC04YTRlLTQ5NWQtOGMwMC0yZTUzODE4YTU0ODAiLCJlbWFpbCI6InNhdHlhbXNpbmdoNTA3NkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiOGUyYjllYWFhMmQxODYxMzAyODQiLCJzY29wZWRLZXlTZWNyZXQiOiI0ODg3OTRmOTJjMDkyMDE0MjUzMzU1OTgzYzcyNjFjZjZiM2VkODI0YjQ4ZGE2Y2NkMzk1NjcwNDczMmRhZTlhIiwiaWF0IjoxNzExMjY5NzIwfQ.cMvw-DYZwA2yAZpf4nss39CVyVtUptFxKBm602n6BSA';

type PollState = {
    newPoll: Poll;
    updatedPoll?: Poll;
    pending: boolean;
    voted?: boolean;
};



export function PollCreateForm() {
    let formRef = useRef<HTMLFormElement>(null);
    let [state, mutate] = useOptimistic(
        { pending: false },
        function createReducer(state, newPoll: PollState) {
            if (newPoll.newPoll) {
                return {
                    pending: newPoll.pending,
                };
            } else {
                return {
                    pending: newPoll.pending,
                };
            }
        },
    );
    const [option1, setOption1] = useState<string>("");
    const [option2, setOption2] = useState<string>("");
    const [option3, setOption3] = useState<string>("");
    const [option4, setOption4] = useState<string>("");

    async function pinFileToIPFS(event: React.ChangeEvent<HTMLInputElement>, optionSetter: React.Dispatch<React.SetStateAction<string>>) {
        const formData = new FormData();
        // @ts-ignore
        const file = event.target.files[0];
        formData.append('file', file);
        const pinataMetaData = JSON.stringify({
            name: "first pic",
        });
        formData.append('pinataMetadata', pinataMetaData);
        const pinataOptions = JSON.stringify({
            cidVersion: 0,
        });
        formData.append('pinataOptions', pinataOptions);

        try {
            const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    'Content-Type': `multipart/form-data;`,
                    'Authorization': `Bearer ${JWT}`
                }
            });
            console.log(res.data.IpfsHash);
            optionSetter(res.data.IpfsHash);
        } catch (error) {
            console.error(error);
        }
    }

    let pollStub = {
        id: uuidv4(),
        created_at: new Date().getTime(),
        title: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        votes1: 0,
        votes2: 0,
        votes3: 0,
        votes4: 0,
    };

    let saveWithNewPoll = savePoll.bind(null, pollStub);
    let [isPending, startTransition] = useTransition();

    return (
        <>
            <div className="mx-8 w-full gap-2">
                <form
                    className="relative my-8 gap-2"
                    ref={formRef}
                    action={saveWithNewPoll}
                    onSubmit={(event) => {
                        event.preventDefault();
                        let formData = new FormData(event.currentTarget);
                        let newPoll = {
                            ...pollStub,
                            title: formData.get("title") as string,
                            option1,
                            option2,
                            option3,
                            option4,
                            votes1: 0,
                            votes2: 0,
                            votes3: 0,
                            votes4: 0,
                        };

                        formRef.current?.reset();
                        startTransition(async () => {
                            mutate({
                                newPoll,
                                pending: true,
                            });

                            await savePoll(newPoll, formData);
                        });
                    }}
                >
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                    />
                    <div className="my-2">
                    <div className="file-upload items-center justify-center">
                        <label htmlFor="file1" className="flex items-center justify-center">
                            {option1 ? (
                                <img className="flex h-[250px] rounded-md" src={`https://turquoise-occasional-meerkat-627.mypinata.cloud/ipfs/${option1}?pinataGatewayToken=WO8LWfz8QTiolWn6Y93P0WzI3rjaVSi8xS3W8H2Kr6UDqsbNKIx2L8XbrrY1b9pl`} alt="Option 1" />
                            ) : (
                                <Image className="flex h-[250px] cursor-pointer rounded-md" src={require("./defaultimage.jpg")} alt="Upload Image" />
                            )}
                        </label>
                        <input
                            type="file"
                            id="file1"
                            name="option1"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(event) => pinFileToIPFS(event, setOption1)}
                        />
                    </div>
                    <div className="file-upload items-center justify-center">
                        <label htmlFor="file2" className="flex items-center justify-center">
                            {option2 ? (
                                <img className="flex h-[250px] rounded-md" src={`https://turquoise-occasional-meerkat-627.mypinata.cloud/ipfs/${option2}?pinataGatewayToken=WO8LWfz8QTiolWn6Y93P0WzI3rjaVSi8xS3W8H2Kr6UDqsbNKIx2L8XbrrY1b9pl`} alt="Option 2" />
                            ) : (
                                <Image className="flex h-[250px] rounded-md cursor-pointer" src={require("./defaultimage.jpg")} alt="Upload Image" />
                            )}
                        </label>
                        <input
                            type="file"
                            id="file2"
                            name="option2"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(event) => pinFileToIPFS(event, setOption2)}
                        />
                    </div>
                    <div className="file-upload items-center justify-center">
                        <label htmlFor="file3" className="flex items-center justify-center">
                            {option3 ? (
                                <img className="flex h-[250px] rounded-md" src={`https://turquoise-occasional-meerkat-627.mypinata.cloud/ipfs/${option3}?pinataGatewayToken=WO8LWfz8QTiolWn6Y93P0WzI3rjaVSi8xS3W8H2Kr6UDqsbNKIx2L8XbrrY1b9pl`} alt="Option 2" />
                            ) : (
                                <Image className="flex h-[250px] rounded-md cursor-pointer" src={require("./defaultimage.jpg")} alt="Upload Image" />
                            )}
                        </label>
                        <input
                            type="file"
                            id="file3"
                            name="option3"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(event) => pinFileToIPFS(event, setOption3)}
                        />
                    </div>
                    <div className="file-upload items-center justify-center">
                        <label htmlFor="file4" className="flex items-center justify-center">
                            {option4 ? (
                                <img className="flex h-[250px] rounded-md" src={`https://turquoise-occasional-meerkat-627.mypinata.cloud/ipfs/${option4}?pinataGatewayToken=WO8LWfz8QTiolWn6Y93P0WzI3rjaVSi8xS3W8H2Kr6UDqsbNKIx2L8XbrrY1b9pl`} alt="Option 2" />
                            ) : (
                                <Image className="flex h-[250px] rounded-md cursor-pointer" src={require("./defaultimage.jpg")} alt="Upload Image" />
                            )}
                        </label>
                        <input
                            type="file"
                            id="file4"
                            name="option4"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(event) => pinFileToIPFS(event, setOption4)}
                        />
                    </div>
                    <div className={"pt-2 flex justify-end"}>
                        <button
                            className={clsx(
                                "flex items-center p-1 justify-center px-4 h-10 text-lg border bg-blue-500 text-white rounded-md w-24 focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700 focus:bg-blue-700",
                                state.pending && "bg-gray-700 cursor-not-allowed",
                            )}
                            type="submit"
                            disabled={state.pending}
                        >
                            Create
                        </button>
                    </div>
                    </div>
                </form>
            </div>
            <div className="w-full"></div>
        </>
    );
}

function PollOptions({ poll, onChange }: { poll: Poll, onChange: (index: number) => void }) {
    return (
        <div className="mb-4 text-left">
            {[poll.option1, poll.option2, poll.option3, poll.option4].filter(e => e !== "").map((option, index) => (
                <label key={index} className="block">
                    <input
                        type="radio"
                        name="poll"
                        value={option}
                        onChange={() => onChange(index + 1)}
                        className="mr-2"
                    />
                    {option}
                </label>
            ))}
        </div>
    );
}

function PollResults({ poll }: { poll: Poll }) {
    return (
        <div className="mb-4">
            <img src={`/api/image?id=${poll.id}&results=true&date=${Date.now()}`} alt='poll results' />
        </div>
    );
}

export function PollVoteForm({ poll, viewResults }: { poll: Poll, viewResults?: boolean }) {
    const [selectedOption, setSelectedOption] = useState(-1);
    const router = useRouter();
    const searchParams = useSearchParams();
    viewResults = true;     // Only allow voting via the api
    let formRef = useRef<HTMLFormElement>(null);
    let voteOnPoll = votePoll.bind(null, poll);
    let [isPending, startTransition] = useTransition();
    let [state, mutate] = useOptimistic(
        { showResults: viewResults },
        function createReducer({ showResults }, state: PollState) {
            if (state.voted || viewResults) {
                return {
                    showResults: true,
                };
            } else {
                return {
                    showResults: false,
                };
            }
        },
    );

    const handleVote = (index: number) => {
        setSelectedOption(index)
    };

    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg p-4 m-4">
            <div className="font-bold text-xl mb-2">{poll.title}</div>
            <form
                className="relative my-8"
                ref={formRef}
                action={() => voteOnPoll(selectedOption)}
                onSubmit={(event) => {
                    event.preventDefault();
                    let formData = new FormData(event.currentTarget);
                    let newPoll = {
                        ...poll,
                    };

                    // @ts-ignore
                    newPoll[`votes${selectedOption}`] += 1;


                    formRef.current?.reset();
                    startTransition(async () => {
                        mutate({
                            newPoll,
                            pending: false,
                            voted: true,
                        });

                        await redirectToPolls();
                        // await votePoll(newPoll, selectedOption);
                    });
                }}
            >
                {state.showResults ? <PollResults poll={poll} /> : <PollOptions poll={poll} onChange={handleVote} />}
                {state.showResults ? <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    type="submit"
                >Back</button> :
                    <button
                        className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" + (selectedOption < 1 ? " cursor-not-allowed" : "")}
                        type="submit"
                        disabled={selectedOption < 1}
                    >
                        Vote
                    </button>
                }
            </form>
        </div>
    );
}