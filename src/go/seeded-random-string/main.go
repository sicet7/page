package seeded_random_string

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/binary"
	"io"
	"math/rand"
)

func GetSeededRandomString(seedString string, length int) (string, error) {
	h := sha256.New()
	_, err := io.WriteString(h, seedString)
	if err != nil {
		return "", err
	}
	seed := binary.BigEndian.Uint64(h.Sum(nil))
	myRand := rand.New(rand.NewSource(int64(seed)))
	output := ""
	var buffer []byte
	for len(output) < length {
		buffer = make([]byte, 32)
		_, err = myRand.Read(buffer)
		if err != nil {
			return "", err
		}
		output = output + base64.URLEncoding.EncodeToString(buffer)
	}
	return output[:length], nil
}
