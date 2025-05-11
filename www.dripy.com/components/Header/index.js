import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import styles from "./header.module.scss";

import SearchIcon from "@/icons/search";
import CartIcon from "@/icons/cart";
import ArrowIcon from "@/icons/arrow";
import MenuIcon from "@/icons/menu";
import CameraIcon from "@/icons/camera";

import { useAuth } from "@/firebase/context";
import { useCart } from "hooks/cart.hook";

export default function Header() {
  const [showHeader, setShowHeader] = useState({
    transform: "translate3d(100vw, 0, 0)",
  });
  const [input, setInput] = useState("");

  const router = useRouter();
  const { user } = useAuth();
  const cart = useCart().data;
  const cartLength = Object.keys(cart).reduce((a, b) => a + cart[b].length, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (input && typeof window !== "undefined") {
      router.push(`/search/${input}`);
    }
  };

  return (
    <nav className={styles.container}>
      <div className={styles.logoContainer}>
        <Link href="/" legacyBehavior>
          <a className={styles.logo}>Dripy</a>
        </Link>

        <div className={styles.rightContentMobile}>
          <Link href="/cart" legacyBehavior>
            <a className={styles.cartContainer}>
              <CartIcon width={28} height={28} className={styles.cartIcon} />
              <div>
                <span>{cartLength || 0}</span>
              </div>
            </a>
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

      <div className={styles.rightMenu} style={showHeader}>
        <div className={styles.menuContent}>
          {user ? (
            <>
              <Link href="/account" legacyBehavior><a>My Account</a></Link>
              <Link href="/account/orders" legacyBehavior><a>My Orders</a></Link>
              <Link href="/account/favorites" legacyBehavior><a>Favourites</a></Link>
              <Link href="/account/logout" legacyBehavior><a>Logout</a></Link>
            </>
          ) : (
            <>
              <Link href="/login" legacyBehavior><a>Login</a></Link>
              <Link href="/login" legacyBehavior><a>Register</a></Link>
            </>
          )}
        </div>
        <div
          className={styles.background}
          onClick={() =>
            setShowHeader({ transform: "translate3d(100vw, 0, 0)" })
          }
        />
      </div>

      <div className={styles.searchContainer}>
        <SearchIcon
          width={20}
          height={20}
          fill="grey"
          className={styles.searchIcon}
        />
        <form onSubmit={handleSearchSubmit}>
          <input
            className={styles.searchInput}
            placeholder="Search for products, brands and more..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </form>
      </div>

      <div className={styles.rightContent}>
        <Link href="/imageSearch" legacyBehavior>
          <a className={styles.cartContainer}>
            <CameraIcon width={20} height={20} className={styles.cartIcon} />
            <span>Search via Photo</span>
          </a>
        </Link>

        <Link href="/cart" legacyBehavior>
          <a className={styles.cartContainer}>
            <CartIcon width={20} height={20} className={styles.cartIcon} />
            <span>Cart: {cartLength || 0}</span>
          </a>
        </Link>

        <div className={styles.profileContainer}>
          <img
            src={user?.photoUrl || "https://picsum.photos/200/200"}
            className={styles.profilePhoto}
            alt="Profile"
            loading="lazy"
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
                  <Link href="/account" legacyBehavior><a>My Account</a></Link>
                  <Link href="/account/orders" legacyBehavior><a>My Orders</a></Link>
                  <Link href="/account/favorites" legacyBehavior><a>Favourites</a></Link>
                  <Link href="/account/logout" legacyBehavior><a>Logout</a></Link>
                </>
              ) : (
                <>
                  <Link href="/login" legacyBehavior><a>Login</a></Link>
                  <Link href="/login" legacyBehavior><a>Register</a></Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
