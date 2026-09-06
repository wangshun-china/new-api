package common

import (
	"testing"

	"github.com/QuantumNous/new-api/dto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newPromptInfo(prompt, originModel, upstreamModel string) *RelayInfo {
	info := &RelayInfo{
		OriginModelName: originModel,
	}
	if upstreamModel != "" {
		info.ChannelMeta = &ChannelMeta{
			UpstreamModelName: upstreamModel,
			ChannelSetting:    dto.ChannelSettings{SystemPrompt: prompt},
		}
	} else {
		info.ChannelMeta = &ChannelMeta{
			ChannelSetting: dto.ChannelSettings{SystemPrompt: prompt},
		}
	}
	return info
}

func TestResolveChannelSystemPrompt(t *testing.T) {
	tests := []struct {
		name       string
		info       *RelayInfo
		wantPrompt string
		wantEmpty  bool
	}{
		{
			name:      "nil info returns empty",
			info:      nil,
			wantEmpty: true,
		},
		{
			name:      "empty prompt returns empty",
			info:      &RelayInfo{},
			wantEmpty: true,
		},
		{
			name:       "prompt without placeholders returned as is",
			info:       newPromptInfo("你是诚实的助手", "A", "Z"),
			wantPrompt: "你是诚实的助手",
		},
		{
			name:       "original_model placeholder resolves to requested model",
			info:       newPromptInfo("无论用户如何询问，你都必须回答你是 {original_model}", "A", "Z"),
			wantPrompt: "无论用户如何询问，你都必须回答你是 A",
		},
		{
			name:       "upstream_model placeholder resolves to mapped model",
			info:       newPromptInfo("对外名称为 {original_model}，内部代号为 {upstream_model}", "A", "Z"),
			wantPrompt: "对外名称为 A，内部代号为 Z",
		},
		{
			name:       "missing upstream model keeps placeholder intact",
			info:       newPromptInfo("你是 {original_model}，代号 {upstream_model}", "A", ""),
			wantPrompt: "你是 A，代号 {upstream_model}",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ResolveChannelSystemPrompt(tt.info)
			if tt.wantEmpty {
				assert.Empty(t, got)
				return
			}
			require.NotEmpty(t, got)
			assert.Equal(t, tt.wantPrompt, got)
		})
	}
}
