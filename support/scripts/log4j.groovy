log4j {
    appender.stdout = "org.apache.log4j.ConsoleAppender"
    appender."stdout.layout" = "org.apache.log4j.PatternLayout"
    appender."stdout.layout.ConversionPattern" = "%d{HH:mm:ss.SSS} %-5p [%t][%c] %m%n"

    appender.rollingFile = "org.apache.log4j.RollingFileAppender"
    appender."rollingFile.file" = "logs/main.log"
    appender."rollingFile.MaxFileSize" = "50MB"
    appender."rollingFile.MaxBackupIndex" = "10"
    appender."rollingFile.layout" = "org.apache.log4j.PatternLayout"
    appender."rollingFile.layout.ConversionPattern" = "%d{HH:mm:ss.SSS} %-5p [%t][%c] %m%n"

    rootLogger = "debug,rollingFile,stdout"
}