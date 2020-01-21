cd %~dp0\..

set JAVA_EXE="C:\Program Files\Java\jre1.8.0_71\bin\java.exe"
if not exist %JAVA_EXE% set JAVA_EXE=java

node src\build\build.js %* | %JAVA_EXE% -Dfile.encoding=UTF-8 -jar ext/java-watch-build-0.4.0-SNAPSHOT-full.jar --watch -v



