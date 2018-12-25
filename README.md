# time-difference
This is a piece of code that converts timestamps (sql) to a more user friendly format like "2 days ago" or "3 weeks ago".

The SQL timestamp should be in UTC time to get the proper result. Difference between user's local time zone and UTC is compensated for by adding/subtracting the timezone difference between the two.

If the timestamp happened after midnight, the output will be either "X hours ago", "Y minutes ago" or "Z seconds ago".
If it happened before midnight, expect "A days ago", "B weeks ago", "C months ago" or " D years ago".

Normal behaviour (all timestamps in UTC):
    1. The event happened yesterday at 23:15. Now it is the following day and it is 1:10 in the morning. Program will return 'Yesterday' even though the event happened less than 2 hours ago.
    2. The event happened today at 2:40 in the morning, now it is 14:10. Program will return '11 hours ago' (It happened today).

_________________________________________________________________________________________________________________________
Version 2.0.0 commited on Dec 25 2018:

For loops have been replaced by modulos(%), the process should now be quicker and easier to read, understand and maintain.

OOP was replaced by functional programming (from a Class to standalone functions). This gives better compatibility with older browsers when `let` and `const` are replaced by `var`.

There are still aproximations (month == 30days, year == 365days), therefore the program is 100% correct. By attempting to fix that, the program would become a lot longer and less readable. That is the reason I decided not to fix that. Feel free to add that yourself and to send a merge request so everybody can benifit from that.

Refer to the example if you have difficulties setting it up.

_________________________________________________________________________________________________________________________
Version 1.0.0 commited on Nov 18 2018:
This is tested and working on Safari, Mozilla and Chrome browsers.
Input string should be in UTC time, the script will automatically compare it to the user's time no matter the timezone.
Feel free to look at examles.


Feel free to copy code to your project and use it.
