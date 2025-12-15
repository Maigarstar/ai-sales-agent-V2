'use client'

import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { ReactNode, ComponentProps } from 'react'

type LightboxComponentProps = ComponentProps<typeof Lightbox>

export type ImageGalleryProps = Partial<LightboxComponentProps> & {
  children?: ReactNode
  index?: number
  onClose?: () => void
}

const ImageGallery = ({
  children,
  index = -1,
  slides = [],
  onClose,
  ...rest
}: ImageGalleryProps) => {
  return (
    <>
      {children}
      <Lightbox
        open={index >= 0}
        index={index}
        slides={slides}
        close={() => onClose?.()}
        {...rest}
      />
    </>
  )
}

export default ImageGallery
