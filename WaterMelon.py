import java .util.Scanner;
public class Watermelon{
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int w = scanner.nextInt();
        if(w>2 && w % 2 == 0){
            System.out.println("Yes");
        }else {
            System.out.println("No");
        }
        scanner.close();
    }
}
