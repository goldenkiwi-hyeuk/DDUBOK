package com.ddubok.api.report.service;

import com.ddubok.api.report.dto.request.ReportMemberReq;

/**
 * 신고 관련 처리를 위한 서비스
 */
public interface ReportService {

    /**
     * 카드의 내용을 신고
     * 
     * @param memberId 신고한 멤버의 번호
     * @param reportMemberReq 신고할 내용을 담은 객체
     * @return 생성된 신고의 고유 id
     */
    Long reportMember(Long memberId, ReportMemberReq reportMemberReq);
}
