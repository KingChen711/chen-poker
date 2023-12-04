import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { createRoom, getCurrentRoom } from '@/lib/actions/room'
import { UserButton, auth } from '@clerk/nextjs'

async function Home() {
  // const { userId: clerkId } = auth()
  // // const router = useRouter()

  // const handleCreateNewRoom = async () => {
  //   if (!clerkId) {
  //     return
  //   }
  //   try {
  //     const response = await createRoom({ clerkId })
  //     // router.push(`/rooms/${response?.roomId}`)
  //   } catch (error) {
  //     // @ts-ignore
  //     if (error.message === 'You are already in a room!') {
  //       toast({
  //         variant: 'destructive',
  //         title: 'You are already in a room!',
  //         description: 'Try rejoin your current room and click leave that room if you want to create a new room!'
  //       })
  //     }
  //   }
  // }

  // const handleJoinCurrentRoom = async () => {
  //   if (!clerkId) {
  //     return
  //   }
  //   try {
  //     const response = await getCurrentRoom({ clerkId })
  //     // router.push(`/rooms/${response.roomId}`)
  //   } catch (error) {
  //     // @ts-ignore
  //     if (error.message === 'Not found your current room!') {
  //       toast({
  //         variant: 'destructive',
  //         title: 'Not found your current room!',
  //         description: 'Try join a room by code or create a new room'
  //       })
  //     }
  //   }
  // }

  return (
    <div>
      {/* <header>
        <UserButton afterSignOutUrl='/' />
      </header> */}
      <main>
        {/* <Button onClick={handleJoinCurrentRoom}>Join your current room</Button>
        <Button onClick={handleCreateNewRoom}>Create a room</Button> */}
        <div className='bg-slate-200'>
          <p className='font-medium'>Join by code</p> <Input /> <Button>Join</Button>
        </div>
      </main>
    </div>
  )
}

export default Home
