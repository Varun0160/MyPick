import React, { useState } from "react";
import styles from "./header.module.scss";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/firebase/context";
import { useCart } from "../../hooks/cart.hook";
import MenuIcon from "@/icons/menu";
import SearchIcon from "@/icons/search";
import CartIcon from "@/icons/cart";
import CameraIcon from "@/icons/camera";
import ArrowIcon from "@/icons/arrow";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function Header() {
  const [showHeader, setShowHeader] = useState({
    transform: "translate3d(100vw, 0, 0)",
  });
  const [input, setInput] = useState("");

  const router = useRouter();
  const { user } = useAuth();
  const { data } = useCart();
  const cartLength = data?.length || 0;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (input.length > 0) {
      router.push(`/search/${input}`);
      setInput("");
    }
  };

  return (
    <nav className={styles.container}>
      <div className={styles.logoContainer}>        <Link href="/" className={styles.logo}>
          MyPick
        </Link>
        <div className={styles.rightContentMobile}>
          <Link href="/cart" className={styles.cartContainer}>
            <CartIcon width={28} height={28} className={styles.cartIcon} />
            <div>
              <span>{cartLength || 0}</span>
            </div>
          </Link>
          <div className={styles.profileContainer}>
            <MenuIcon
              width={30}
              height={30}
              className={styles.menuIcon}
              onClick={() =>
                setShowHeader({ transform: "translate3d(0vw, 0, 0)" })
              }
            />
          </div>
        </div>
      </div>

      <div className={styles.rightContent}>
        <Link href="/imageSearch" className={styles.cartContainer}>
          <CameraIcon width={20} height={20} className={styles.cartIcon} />
          <span>Search via Photo</span>
        </Link>
        <Link href="/cart" className={styles.cartContainer}>
          <CartIcon width={20} height={20} className={styles.cartIcon} />
          <span>Cart: {cartLength || 0}</span>
        </Link>
        <div className={styles.profileContainer}>
          <ImageWithFallback
            src={user?.photoUrl || "https://picsum.photos/200/200"}
            className={styles.profilePhoto}
            alt="Profile"
          />
          <span>
            Hello{" "}
            <span style={{ fontWeight: "normal" }}>
              {user?.name || "Guest"}
            </span>
          </span>
          <ArrowIcon width={10} height={10} className={styles.arrowIcon} />
          <div className={styles.dropdown}>
            <div className={styles.arrowUp} />
            <div className={styles.dropdownMenu}>
              {user ? (
                <>
                  <Link
                    href="/account"
                    className={styles.dropdownLink}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className={styles.dropdownLink}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/account/favorites"
                    className={styles.dropdownLink}
                  >
                    Favourites
                  </Link>
                  <Link
                    href="/account/logout"
                    className={styles.dropdownLink}
                  >
                    Logout
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={styles.dropdownLink}
                  >
                    Login
                  </Link>
                  <Link
                    href="/login"
                    className={styles.dropdownLink}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
