import HomeButtons from '@/components/home/HomeButtons'
import Image from 'next/image'
function Home() {
  return (
    <main className='grid min-h-screen grid-cols-12 pb-6 pt-24'>
      <div className='col-span-12 flex flex-col items-center justify-center py-6 lg:col-span-6 lg:items-start'>
        <div className='mb-8 max-w-lg text-center text-3xl lg:text-start lg:text-5xl'>
          Chơi game Poker cùng với bạn bè của bạn hoàn toàn miễn phí
        </div>
        <HomeButtons />
      </div>

      <div className='col-span-12 flex items-center justify-center p-6 lg:col-span-6'>
        <div className='relative aspect-square w-[95%]'>
          <Image fill src='/assets/images/banner.png' alt='banner' />
        </div>
      </div>
    </main>
  )
}

export default Home
