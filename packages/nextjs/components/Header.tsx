"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import abi from "./abi/ContractAbi.json";
import { IDKitWidget, ISuccessResult, useIDKit } from "@worldcoin/idkit";
import { ConnectKitButton } from "connectkit";
import { decodeAbiParameters, parseAbiParameters } from "viem";
import { type BaseError, useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import LogoSVG from "~~/app/assets/svg/logo";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Pools",
    href: "/pools",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`hover:!text-white hover:!bg-black ${
                isActive ? "bg-black shadow-md !text-white " : ""
              } hover:bg-secondary hover:shadow-md text-black focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const account = useAccount();
  const [done, setDone] = useState(false);
  const { setOpen } = useIDKit();
  const { data: hash, isPending, error, writeContractAsync } = useWriteContract();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );
  const submitTx = async (proof: ISuccessResult) => {
    try {
      await writeContractAsync({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
        account: account.address!,
        abi,
        functionName: "verifyAndExecute",
        args: [
          account.address!,
          BigInt(proof!.merkle_root),
          BigInt(proof!.nullifier_hash),
          decodeAbiParameters(parseAbiParameters("uint256[8]"), proof!.proof as `0x${string}`)[0],
        ],
      });
      setDone(true);
    } catch (error) {
      throw new Error((error as BaseError).shortMessage);
    }
  };

  return (
    <div className="sticky lg:static top-0 navbar bg-white min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        {/* <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks />
            </ul>
          )}
        </div> */}
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          {/* <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div> */}
          {/* <div className="flex flex-col">
            <span className="font-bold leading-tight">Scaffold-ETH</span>
            <span className="text-xs">Ethereum dev stack</span>
          </div> */}
        </Link>

        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
        <span className="pl-4">
          <LogoSVG />
        </span>
      </div>

      <div>
        {account.isConnected && (
          <>
            <IDKitWidget
              app_id={process.env.NEXT_PUBLIC_APP_ID as `app_${string}`}
              action={process.env.NEXT_PUBLIC_ACTION as string}
              signal={account.address}
              onSuccess={submitTx}
              autoClose
            ></IDKitWidget>
            {!done && (
              <button onClick={() => setOpen(true)}>
                {!hash && (isPending ? "Pending, please check your wallet..." : "World ID Connection")}
              </button>
            )}

            {hash && <p>Transaction Hash: {hash}</p>}
            {isConfirming && <p>Waiting for confirmation...</p>}
            {isConfirmed && <p>Transaction confirmed.</p>}
            {error && <p>Error: {(error as BaseError).message}</p>}
          </>
        )}
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
};
