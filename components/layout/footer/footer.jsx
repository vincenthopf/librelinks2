import useMediaQuery from '@/hooks/use-media-query';

const Footer = () => {
  const { isMobile } = useMediaQuery();

  // Return empty fragment instead of null for better compatibility
  return <></>;
};

export default Footer;
