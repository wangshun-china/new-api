package common

import (
	"strings"
)

// 渠道系统提示词支持的占位符，在注入请求前按当前请求替换：
//   {original_model} — 用户请求的模型名（模型映射前）
//   {upstream_model} — 模型映射后实际请求上游的模型名
const (
	SystemPromptOriginalModelPlaceholder = "{original_model}"
	SystemPromptUpstreamModelPlaceholder = "{upstream_model}"
)

// ResolveChannelSystemPrompt 返回按当前请求解析占位符后的渠道系统提示词，
// 未配置时返回空串。配合模型映射，可以让同一渠道上的多个映射模型各自
// 报出用户请求的模型名，而不是共用一句固定身份。
func ResolveChannelSystemPrompt(info *RelayInfo) string {
	if info == nil || info.ChannelMeta == nil {
		return ""
	}
	prompt := info.ChannelMeta.ChannelSetting.SystemPrompt
	if prompt == "" {
		return ""
	}
	prompt = strings.ReplaceAll(prompt, SystemPromptOriginalModelPlaceholder, info.OriginModelName)
	if info.UpstreamModelName != "" {
		prompt = strings.ReplaceAll(prompt, SystemPromptUpstreamModelPlaceholder, info.UpstreamModelName)
	}
	return prompt
}
