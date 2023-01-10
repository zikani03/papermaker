FROM golang:1.19-alpine as go-builder
RUN apk add --no-cache git
WORKDIR /go/papermaker-src
COPY . .
RUN go generate -x -v
RUN go build -ldflags "-s -w" -o /bin/papermaker ./cmd/server/ && chmod +x /bin/papermaker

MAINTAINER Zikani Nyirenda Mwase <zikani.nmwase@ymail.com>
FROM golang:1.19-alpine
COPY --from=go-builder /bin/papermaker /papermaker
ENV PAPERMAKER_ADDRESS=8000
CMD [ "/papermaker" ]