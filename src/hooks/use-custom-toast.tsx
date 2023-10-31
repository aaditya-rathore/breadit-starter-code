import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { buttonVariants } from "@/components/ui/Button"

export const useCustomToast = () => {
    const loginToast = () => {
        const {dismiss} = toast({
            title: "Login required.",
            description: "You need be logged in to do that",
            variant: "destructive",
            action: (
                <Link
                    
                    onClick={() => dismiss()} 
                    href="/sign-in"
                    className={buttonVariants({variant: "outline"})}>
                        Login
                </Link>   
                    
            ),
        })
    }

    return {loginToast}
}