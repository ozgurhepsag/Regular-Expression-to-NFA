# Regular Expression to NFA

This is a JavaScript program, which converts a given regular expression to NFA. The program takes two inputs from the user; a regular expression and a string to test. It returns True if the NFA accepts the given string, otherwise returns False.

For example:

TestNFA (“(a+b)*.c.a*”, “aaabc”)
> True

TestNFA (“(a+b)*.c.a*”, “acabb”)
>False

TestNFA (“b.a*+c*.(a.b*.a)”, “cccaa”)
> True

TestNFA (“b.a*+c*.(a.b*.a)”, “bba”)
>False

You need to assume that:
- The regular expression only contains star (*), union (+) and concatenation (.) operators.
- The regular expression is syntactically correct. So you don’t need to check syntax errors.
- The regular expression contains only one-level parentheses. No nested parentheses exist.
