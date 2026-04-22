# Pattern Printing in Java - Complete Notes

## 1. Solid Patterns

### 1.1 Square Pattern

**Logic**: Outer loop runs `n` times (rows). Inner loop also runs `n` times (columns). Print `* ` every time. After inner loop, go to next line.

```java
import java.util.Scanner;

public class SquarePattern {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter n: ");
        int n = sc.nextInt();

        for(int i = 1; i <= n; i++) {
            for(int j = 1; j <= n; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
        sc.close();
    }
}
```

**Sample Output (n=4)**:

```
* * * *
* * * *
* * * *
* * * *
```

### 1.2 Right Angled Triangle (Solid Stars)

**Logic**: Outer loop = rows (1 to n). Inner loop runs only `i` times so that each row has one extra star than previous.

```java
import java.util.Scanner;

public class RightTriangle {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter n: ");
        int n = sc.nextInt();

        for(int i = 1; i <= n; i++) {
            for(int j = 1; j <= i; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
        sc.close();
    }
}
```

**Sample Output (n=5)**:

```
*
* *
* * *
* * * *
* * * * *
```

> [!tip] Pro Tip  
> Always put `sc.close();` at the end to avoid resource warning. Small habit but good practice!

---

## 2. Number and Character Patterns

### 2.1 Number Triangle (Simple)

**Logic**: Same as right triangle but instead of `*` we print the column number `j`.

```java
import java.util.Scanner;

public class NumberTriangle {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter n: ");
        int n = sc.nextInt();

        for(int i = 1; i <= n; i++) {
            for(int j = 1; j <= i; j++) {
                System.out.print(j + " ");
            }
            System.out.println();
        }
        sc.close();
    }
}
```

**Sample Output (n=5)**:

```
1
1 2
1 2 3
1 2 3 4
1 2 3 4 5
```

### 2.2 Character Pattern (Alphabet Triangle)

**Logic**: Start with `'A'`. For every position print the character and increase it.

```java
import java.util.Scanner;

public class CharacterTriangle {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter n: ");
        int n = sc.nextInt();
        char ch = 'A';

        for(int i = 1; i <= n; i++) {
            for(int j = 1; j <= i; j++) {
                System.out.print(ch + " ");
                ch++;
            }
            System.out.println();
            // Reset ch for next row if you want same letter start again (optional)
        }
        sc.close();
    }
}
```

**Sample Output (n=4)**:

```
A
B C
D E F
G H I J
```

---

## 3. Inverted and Mirrored Patterns

### 3.1 Inverted Right Angled Triangle

**Logic**: Outer loop starts from `n` and decreases to 1. Inner loop prints stars equal to current row value.

```java
import java.util.Scanner;

public class InvertedTriangle {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter n: ");
        int n = sc.nextInt();

        for(int i = n; i >= 1; i--) {
            for(int j = 1; j <= i; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
        sc.close();
    }
}
```

**Sample Output (n=5)**:

```
* * * * *
* * * *
* * *
* *
*
```

### 3.2 Mirrored Right Angled Triangle

**Logic**: First inner loop prints spaces (`n-i`), second prints stars (`i`).

```java
import java.util.Scanner;

public class MirroredTriangle {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter n: ");
        int n = sc.nextInt();

        for(int i = 1; i <= n; i++) {
            // spaces
            for(int j = 1; j <= n - i; j++) {
                System.out.print("  ");
            }
            // stars
            for(int j = 1; j <= i; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
        sc.close();
    }
}
```

**Sample Output (n=5)**:

```
        *
      * *
    * * *
  * * * *
* * * * *
```

---

## 4. Pyramid and Diamond Patterns

### 4.1 Pyramid Pattern (Centered)

**Logic**: Spaces decrease (`n-i`), stars increase by 2 each row (`2*i-1`). This makes perfect center pyramid.

```java
import java.util.Scanner;

public class PyramidPattern {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter n: ");
        int n = sc.nextInt();

        for(int i = 1; i <= n; i++) {
            // spaces
            for(int j = 1; j <= n - i; j++) {
                System.out.print(" ");
            }
            // stars
            for(int j = 1; j <= 2 * i - 1; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
        sc.close();
    }
}
```

**Sample Output (n=5)**:

```
    *
   ***
  *****
 *******
*********
```

### 4.2 Diamond Pattern

**Logic**: Upper half = pyramid, lower half = inverted pyramid. Total rows = `2*n-1`.

```java
import java.util.Scanner;

public class DiamondPattern {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter n: ");
        int n = sc.nextInt();

        // Upper half
        for(int i = 1; i <= n; i++) {
            for(int j = 1; j <= n - i; j++) System.out.print(" ");
            for(int j = 1; j <= 2 * i - 1; j++) System.out.print("*");
            System.out.println();
        }
        // Lower half
        for(int i = n-1; i >= 1; i--) {
            for(int j = 1; j <= n - i; j++) System.out.print(" ");
            for(int j = 1; j <= 2 * i - 1; j++) System.out.print("*");
            System.out.println();
        }
        sc.close();
    }
}
```

**Sample Output (n=4)**:

```
   *
  ***
 *****
*******
 *****
  ***
   *
```

---

## 5. Advanced Number Patterns

### 5.1 Floyd’s Triangle

**Logic**: One counter `num` starts at 1 and keeps increasing. No need to calculate anything extra.

```java
import java.util.Scanner;

public class FloydsTriangle {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter n: ");
        int n = sc.nextInt();
        int num = 1;

        for(int i = 1; i <= n; i++) {
            for(int j = 1; j <= i; j++) {
                System.out.print(num + " ");
                num++;
            }
            System.out.println();
        }
        sc.close();
    }
}
```

**Sample Output (n=5)**:

```
1
2 3
4 5 6
7 8 9 10
11 12 13 14 15
```

### 5.2 Pascal’s Triangle

**Logic**: Each number is calculated as `coeff = coeff * (i-j) / (j+1)`. Very efficient and no extra space needed.

```java
import java.util.Scanner;

public class PascalsTriangle {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter n: ");
        int n = sc.nextInt();

        for(int i = 0; i < n; i++) {
            int coeff = 1;
            // spaces for centering (optional but looks nice)
            for(int space = 1; space <= n - i; space++) {
                System.out.print("  ");
            }
            for(int j = 0; j <= i; j++) {
                System.out.print(coeff + "   ");
                coeff = coeff * (i - j) / (j + 1);
            }
            System.out.println();
        }
        sc.close();
    }
}
```

**Sample Output (n=5)**:

```
          1
        1   1
      1   2   1
    1   3   3   1
  1   4   6   4   1
```

> [!important] Note  
> For large n (>10) numbers become very big. Keep n small for nice output.

---

## Bonus Important Patterns (Very Common in Interviews)

### Hollow Square Pattern

**Logic**: Print `*` only on borders, space inside.

```java
import java.util.Scanner;

public class HollowSquare {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter n: ");
        int n = sc.nextInt();

        for(int i = 1; i <= n; i++) {
            for(int j = 1; j <= n; j++) {
                if(i == 1 || i == n || j == 1 || j == n) {
                    System.out.print("* ");
                } else {
                    System.out.print("  ");
                }
            }
            System.out.println();
        }
        sc.close();
    }
}
```

### Butterfly Pattern (Super Favourite in Interviews)

**Logic**: Upper half + lower half with spaces in middle.

```java
import java.util.Scanner;

public class ButterflyPattern {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter n: ");
        int n = sc.nextInt();

        // Upper half
        for(int i = 1; i <= n; i++) {
            for(int j = 1; j <= i; j++) System.out.print("* ");
            for(int j = 1; j <= 2*(n-i); j++) System.out.print("  ");
            for(int j = 1; j <= i; j++) System.out.print("* ");
            System.out.println();
        }
        // Lower half
        for(int i = n; i >= 1; i--) {
            for(int j = 1; j <= i; j++) System.out.print("* ");
            for(int j = 1; j <= 2*(n-i); j++) System.out.print("  ");
            for(int j = 1; j <= i; j++) System.out.print("* ");
            System.out.println();
        }
        sc.close();
    }
}
```

**Sample Output (n=4)**:

```
*             *
* *         * *
* * *     * * *
* * * * * * * *
* * * * * * * *
* * *     * * *
* *         * *
*             *
```

---
