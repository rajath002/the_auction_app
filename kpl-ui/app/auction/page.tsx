"use client";
import { AuctionContainer } from "@/components/ActionContainer";
import RoleGuard from "@/components/RoleGuard";

export default function AuctionPage() {
  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="h-20"></div>
      <AuctionContainer />
    </RoleGuard>
  );
}
