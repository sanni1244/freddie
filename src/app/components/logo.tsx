import Image from "next/image"

const Logo = () => {
  return (
    <>
    <Image
              src={"/images/mylogo.png"}
              alt="logo"
              width={60}
              height={10}
              className="rounded-full logo-border"
              priority
            />
        </>
  )
}

export default Logo;


