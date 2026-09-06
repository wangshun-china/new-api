package openai

import (
	"testing"

	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/stretchr/testify/assert"
)

func mappedInfo() *relaycommon.RelayInfo {
	return &relaycommon.RelayInfo{
		OriginModelName: "glm-5.2",
		ChannelMeta: &relaycommon.ChannelMeta{
			UpstreamModelName: "Deepseek-v4-flash",
			IsModelMapped:     true,
		},
	}
}

func TestRewriteMappedModelName(t *testing.T) {
	tests := []struct {
		name string
		info *relaycommon.RelayInfo
		data string
		want string
	}{
		{
			name: "rewrites model field in stream chunk",
			info: mappedInfo(),
			data: `{"id":"1","model":"Deepseek-v4-flash","choices":[{"delta":{"content":"hi"}}]}`,
			want: `{"id":"1","model":"glm-5.2","choices":[{"delta":{"content":"hi"}}]}`,
		},
		{
			name: "rewrites model field in non-stream body",
			info: mappedInfo(),
			data: `{"id":"1","object":"chat.completion","model":"Deepseek-v4-flash","usage":{"total_tokens":5}}`,
			want: `{"id":"1","object":"chat.completion","model":"glm-5.2","usage":{"total_tokens":5}}`,
		},
		{
			name: "no mapping keeps data unchanged",
			info: &relaycommon.RelayInfo{
				OriginModelName: "glm-5.2",
				ChannelMeta:     &relaycommon.ChannelMeta{UpstreamModelName: "Deepseek-v4-flash"},
			},
			data: `{"model":"Deepseek-v4-flash"}`,
			want: `{"model":"Deepseek-v4-flash"}`,
		},
		{
			name: "empty upstream model keeps data unchanged",
			info: &relaycommon.RelayInfo{
				OriginModelName: "glm-5.2",
				ChannelMeta:     &relaycommon.ChannelMeta{IsModelMapped: true},
			},
			data: `{"model":"Deepseek-v4-flash"}`,
			want: `{"model":"Deepseek-v4-flash"}`,
		},
		{
			name: "spaced serialization is left untouched",
			info: mappedInfo(),
			data: `{"model": "Deepseek-v4-flash"}`,
			want: `{"model": "Deepseek-v4-flash"}`,
		},
		{
			name: "only first occurrence is rewritten",
			info: mappedInfo(),
			data: `{"model":"Deepseek-v4-flash","note":"\"model\":\"Deepseek-v4-flash\""}`,
			want: `{"model":"glm-5.2","note":"\"model\":\"Deepseek-v4-flash\""}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, rewriteMappedModelName(tt.info, tt.data))
		})
	}
}
