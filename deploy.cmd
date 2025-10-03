@echo off
setlocal enabledelayedexpansion

set host=%1
set appName=%2
set imageName=%3
set tagPrefix=%4
set imageVersion=%5

if "%host%"=="" (
    echo Error: Missing required parameters
    echo Usage: deploy.cmd ^<host^> ^<appName^> ^<imageName^> ^<tagPrefix^> [imageVersion]
    exit /b 1
)

if "%appName%"=="" (
    echo Error: Missing required parameters
    echo Usage: deploy.cmd ^<host^> ^<appName^> ^<imageName^> ^<tagPrefix^> [imageVersion]
    exit /b 1
)

if "%imageName%"=="" (
    echo Error: Missing required parameters
    echo Usage: deploy.cmd ^<host^> ^<appName^> ^<imageName^> ^<tagPrefix^> [imageVersion]
    exit /b 1
)

if "%tagPrefix%"=="" (
    echo Error: Missing required parameters
    echo Usage: deploy.cmd ^<host^> ^<appName^> ^<imageName^> ^<tagPrefix^> [imageVersion]
    exit /b 1
)

if "%imageVersion%"=="" (
    echo No version provided, checking for git tags starting with '!tagPrefix!'...
    for /f "tokens=*" %%i in ('git tag --list "!tagPrefix!*" --sort=-creatordate') do (
        set imageVersion=%%i
        goto :found_tag
    )
    :found_tag
    if "!imageVersion!"=="" (
        echo No git tags found starting with '!tagPrefix!'
        set /p "imageVersion=Image version: "
    ) else (
        set imageVersion=!imageVersion:%tagPrefix%=!
        echo Found latest tag: !imageVersion!
    )
)

caprover deploy --host %host% --appName %appName% --imageName %imageName%:%imageVersion%
