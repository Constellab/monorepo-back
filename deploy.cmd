
set host=%1
set appName=%2
set imageName=%3


set /p "imageVersion=Image version: "

caprover deploy --host %host% --appName %appName% --imageName %imageName%:%imageVersion%
